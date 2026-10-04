"""Dry-run replay of a named storm: features -> model -> alert engine -> rendered messages.

Nothing is sent. OMNI is already at the bow shock, so it enters `forecast_from_5min` directly
(AGENTS section 6 rule 4: never shift twice). One cycle per 5 min, like the worker.
"""

import argparse
from dataclasses import dataclass
from datetime import datetime

import numpy as np
import pandas as pd

from app.alerts.engine import (
    DEFAULT_CFG,
    AlertConfig,
    AlertEvent,
    AlertState,
    Level,
    _p,
    step,
)
from app.alerts.templates import render
from app.core.constants import HORIZONS_H, KP_TOL
from app.features.targets import kp_last
from app.models import registry
from app.schemas.forecast import KpForecast
from app.workers.scheduler import forecast_from_5min
from ml.dataset import ROOT, load_cfg

CADENCE = pd.Timedelta("5min")
HISTORY = pd.Timedelta("8h")  # the worker's query window
SEQUENCE = [Level.WARNING, Level.ACTIVE, Level.ALL_CLEAR]


@dataclass(frozen=True)
class Tick:
    t: datetime
    p: float
    observed_kp: float | None
    stale: bool
    level: Level


def _last_sample(omni5: pd.DataFrame, t: pd.Timestamp) -> datetime | None:
    """End of the newest complete bin with speed and Bz (bins starting before t only)."""
    ok = omni5.loc[t - HISTORY : t - CADENCE, ["speed_kms", "bz_gsm_nt"]].dropna()
    return None if ok.empty else (ok.index[-1] + pd.Timedelta("4min")).to_pydatetime()


def replay(
    omni5: pd.DataFrame,
    kp3h: pd.Series,
    start: pd.Timestamp,
    end: pd.Timestamp,
    models: dict,
    cfg: AlertConfig = DEFAULT_CFG,
) -> tuple[list[Tick], list[AlertEvent]]:
    state, ticks, events = AlertState(), [], []
    for t in pd.date_range(start, end, freq=CADENCE):
        out = forecast_from_5min(
            omni5.loc[t - HISTORY : t], kp3h, t.to_pydatetime(), _last_sample(omni5, t), models
        )
        fc = KpForecast(**out)
        obs = kp_last(pd.DatetimeIndex([t]), kp3h).iloc[0]
        observed = None if np.isnan(obs) else float(obs)
        state, new = step(state, fc, observed, cfg)
        events += new
        ticks.append(
            Tick(t.to_pydatetime(), _p(fc, cfg.kp_threshold), observed, fc.data_stale, state.level)
        )
    return ticks, events


def summarise(
    ticks: list[Tick], events: list[AlertEvent], kp3h: pd.Series, cfg: AlertConfig = DEFAULT_CFG
) -> dict:
    thr = cfg.kp_threshold - KP_TOL

    def first(level: Level) -> datetime | None:
        return next((e.issued_at for e in events if e.level == level), None)

    def storm_within(a: pd.Timestamp, b: pd.Timestamp) -> bool:
        return bool((kp3h.loc[a:b] >= thr).any())

    onset = kp3h.loc[
        pd.Timestamp(ticks[0].t).floor("3h") : pd.Timestamp(ticks[-1].t)
        + pd.Timedelta(hours=max(HORIZONS_H))
    ]
    onset = onset[onset >= thr]
    first_obs = onset.index[0].to_pydatetime() if len(onset) else None
    warn = first(Level.WARNING)
    it = iter(e.level for e in events)
    return {
        "first_warning": warn,
        "first_active": first(Level.ACTIVE),
        "all_clear": first(Level.ALL_CLEAR),
        "first_obs_g1": first_obs,
        "lead_h": (first_obs - warn).total_seconds() / 3600 if warn and first_obs else None,
        "sequence_ok": all(lv in it for lv in SEQUENCE),
        "false_warnings": sum(
            not storm_within(
                pd.Timestamp(e.issued_at).floor("3h"),
                pd.Timestamp(e.issued_at) + pd.Timedelta(hours=max(HORIZONS_H)),
            )
            for e in events
            if e.level == Level.WARNING
        ),
    }


def _utc(idx: pd.Index) -> pd.DatetimeIndex:
    d = pd.DatetimeIndex(idx)
    return d.tz_localize("UTC") if d.tz is None else d


def _drivers(omni5: pd.DataFrame, at: datetime) -> list[str]:
    row = omni5.loc[: pd.Timestamp(at)].iloc[-1]
    return [f"Bz {row.bz_gsm_nt:.0f} nT", f"solar wind {row.speed_kms:.0f} km/s"]


def _report(
    storm: str, tz: str, s: dict, ticks: list[Tick], events: list[AlertEvent], omni5, cfg
) -> str:
    lines = [f"# Replay: {storm} (dry run, nothing sent)", "", "## Summary", ""]
    lines += [f"- {k}: {v}" for k, v in s.items()]
    lines += ["", "## Messages", ""]
    for e in events:
        for persona in ("aurora", "gnss"):
            body = render(e, persona, tz, _drivers(omni5, e.issued_at), cfg)
            lines += [f"### {e.level} / {persona} / {e.issued_at:%Y-%m-%d %H:%M} UTC", "", body, ""]
    lines += [
        "## Hourly",
        "",
        "| UTC | observed Kp | P(>=thr) | stale | level |",
        "|---|---|---|---|---|",
    ]
    for k in (k for k in ticks if k.t.minute == 0):
        kp = "" if k.observed_kp is None else f"{k.observed_kp:.2f}"
        lines.append(f"| {k.t:%m-%d %H:%M} | {kp} | {k.p:.2f} | {k.stale} | {k.level} |")
    return "\n".join(lines) + "\n"


def main(config: str, storm: str, pad_days: int = 2, tz: str = "Asia/Kolkata") -> int:
    cfg = load_cfg(config)
    hold = load_cfg(ROOT / cfg["holdout"])
    s = next(x for x in hold["storms"] if x["id"] == storm)
    omni5 = pd.read_parquet(ROOT / cfg["omni_parquet"])
    kp3h = pd.read_parquet(ROOT / cfg["kp_parquet"])["kp"]
    omni5.index = _utc(omni5.index)
    kp3h.index = _utc(kp3h.index)
    models = {
        h: registry.load(ROOT / cfg["artefact_dir"] / f"stage2_h{h}.joblib")[0] for h in HORIZONS_H
    }
    pad = pd.Timedelta(days=pad_days)
    start = pd.Timestamp(s["start"], tz="UTC") - pad
    end = pd.Timestamp(s["end"], tz="UTC") + pd.Timedelta(days=1) + pad
    ticks, events = replay(omni5, kp3h, start, end, models)
    summary = summarise(ticks, events, kp3h)
    out = ROOT / "docs" / "reports" / f"replay-{storm}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(_report(storm, tz, summary, ticks, events, omni5, DEFAULT_CFG))
    print(f"{storm}: {[(str(e.level), f'{e.issued_at:%m-%d %H:%M}') for e in events]} -> {out}")
    return 0 if summary["sequence_ok"] else 1


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    ap.add_argument("--storm", default="2024-05-gannon")
    ap.add_argument("--pad-days", type=int, default=2)
    ap.add_argument("--tz", default="Asia/Kolkata")
    a = ap.parse_args()
    raise SystemExit(main(a.config, a.storm, a.pad_days, a.tz))
