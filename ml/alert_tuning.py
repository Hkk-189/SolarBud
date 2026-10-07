"""Choose alert parameters on the validation block. Never run this on held-out storms to tune.

Forecasts do not depend on AlertConfig, so the expensive part (`ml.backtest.forecast_stream`) is
computed once per segment and every grid point only re-runs the state machine.
"""

import argparse
import hashlib
import time
from dataclasses import dataclass, replace
from itertools import product
from pathlib import Path
from typing import cast

import joblib
import numpy as np
import pandas as pd

from app.alerts.engine import DEFAULT_CFG, AlertConfig, AlertEvent, Level
from app.core.constants import HORIZONS_H, KP_TOL
from app.models import registry
from ml.backtest import (
    CADENCE,
    HISTORY,
    Cycle,
    Tick,
    _utc,
    forecast_stream,
    is_false_warning,
    run_alerts,
)
from ml.dataset import ROOT, load_cfg
from ml.splits import split_masks

COOLDOWNS = (12, 24, 36, 72)  # cycles of 5 min: 1, 2, 3, 6 h
P_CLEARS = (0.2, 0.3, 0.4)
CHUNK = pd.Timedelta(days=7)
HOURS_PER_MONTH = 730.5
EPISODE_GAP = pd.Timedelta(hours=24)  # Kp >= threshold bins closer than this are one storm
LEAD_WINDOW = pd.Timedelta(hours=3)  # a WARNING must hold within this long before the onset bin
KP_BIN = pd.Timedelta(hours=3)  # ACTIVE can fire only when the onset bin completes
MISS_KINDS = ("late", "stale", "rose", "flat")
HELD = {Level.WARNING, Level.ACTIVE}


@dataclass(frozen=True)
class Score:
    hours: float = 0.0
    storms: int = 0
    missed: int = 0
    false_warnings: int = 0
    events: int = 0
    leads: tuple[float, ...] = ()
    miss_kinds: tuple[str, ...] = ()

    def __add__(self, o: "Score") -> "Score":
        return Score(
            self.hours + o.hours,
            self.storms + o.storms,
            self.missed + o.missed,
            self.false_warnings + o.false_warnings,
            self.events + o.events,
            self.leads + o.leads,
            self.miss_kinds + o.miss_kinds,
        )

    def per_month(self, name: str) -> float:
        return getattr(self, name) / (self.hours / HOURS_PER_MONTH)

    @property
    def median_lead_h(self) -> float | None:
        return float(np.median(self.leads)) if self.leads else None


def storm_onsets(kp3h: pd.Series, thr: float) -> list[pd.Timestamp]:
    """Start of the first Kp >= thr bin of each storm episode."""
    onsets: list[pd.Timestamp] = []
    prev = None
    for t in kp3h.index[kp3h >= thr]:
        if prev is None or t - prev > EPISODE_GAP:
            onsets.append(t)
        prev = t
    return onsets


def val_segments(index: pd.DatetimeIndex, cfg: dict) -> list[tuple[pd.Timestamp, pd.Timestamp]]:
    """Contiguous validation runs: 2022-24 minus the held-out storm buffers."""
    mask = split_masks(index, cfg)["val"]
    edges = np.flatnonzero(np.diff(np.concatenate([[0], mask.astype(int), [0]])))
    return [(index[a], index[b - 1]) for a, b in zip(edges[::2], edges[1::2], strict=True)]


def model_key(models_dir: Path) -> str:
    """Content hash of the Stage 2 artefacts, so a retrain never reuses stale cached forecasts."""
    h = hashlib.sha256()
    for hz in HORIZONS_H:
        h.update((models_dir / f"stage2_h{hz}.joblib").read_bytes())
    return h.hexdigest()[:12]


def _classify_miss(
    times: pd.DatetimeIndex,
    held: np.ndarray,
    p: np.ndarray,
    stale: np.ndarray,
    onset: pd.Timestamp,
    cfg: AlertConfig,
) -> str:
    """Why a storm onset had no WARNING in the LEAD_WINDOW before it (see MISS_KINDS)."""
    if ((times > onset) & (times < onset + KP_BIN) & held).any():
        return "late"
    pre = (times >= onset - LEAD_WINDOW) & (times <= onset)
    if stale[pre].mean() >= 0.5:
        return "stale"
    near = (times >= onset - LEAD_WINDOW) & (times < onset + KP_BIN) & ~stale
    return "rose" if near.any() and p[near].max() > cfg.p_clear else "flat"


def score(ticks: list[Tick], events: list[AlertEvent], kp3h: pd.Series, cfg: AlertConfig) -> Score:
    thr = cfg.kp_threshold - KP_TOL
    times = pd.DatetimeIndex([k.t for k in ticks])
    held = np.array([k.level in HELD for k in ticks])
    p = np.array([k.p for k in ticks])
    stale = np.array([k.stale for k in ticks])
    leads, missed, storms = [], 0, 0
    kinds: list[str] = []
    for o in storm_onsets(kp3h, thr):
        if not times[0] + LEAD_WINDOW <= o <= times[-1]:
            continue
        storms += 1
        in_window = np.flatnonzero((times >= o - LEAD_WINDOW) & (times <= o) & held)
        if len(in_window) == 0:
            missed += 1
            kinds.append(_classify_miss(times, held, p, stale, o, cfg))
            continue
        i = in_window[-1]
        while i > 0 and held[i - 1]:
            i -= 1
        leads.append((o - times[i]).total_seconds() / 3600)
    return Score(
        hours=len(ticks) * CADENCE.total_seconds() / 3600,
        storms=storms,
        missed=missed,
        false_warnings=sum(
            is_false_warning(e.issued_at, kp3h, thr) for e in events if e.level == Level.WARNING
        ),
        events=len(events),
        leads=tuple(leads),
        miss_kinds=tuple(kinds),
    )


def pick(results: dict[AlertConfig, Score], baseline: AlertConfig) -> AlertConfig:
    """Fewest false warnings with no more missed storms than the baseline; then fewer events."""
    ok = [c for c, s in results.items() if s.missed <= results[baseline].missed]
    return min(ok, key=lambda c: (results[c].false_warnings, results[c].events, c.cooldown_cycles))


def chunks(seg: tuple[pd.Timestamp, pd.Timestamp]) -> list[tuple[pd.Timestamp, pd.Timestamp]]:
    start, end = seg
    return [(a, min(a + CHUNK - CADENCE, end)) for a in pd.date_range(start, end, freq=CHUNK)]


def _chunk_cycles(omni5, kp3h, models_dir, version, a, b, cache) -> list[Cycle]:
    path = cache / f"{a:%Y%m%d-%H%M}.joblib"
    if path.exists():
        return joblib.load(path)
    models = {h: registry.load(models_dir / f"stage2_h{h}.joblib")[0] for h in HORIZONS_H}
    assert all(m.version == version for m in models.values())
    t0 = time.perf_counter()
    out = forecast_stream(omni5.loc[a - HISTORY : b], kp3h, a, b, models)
    joblib.dump(out, path)
    print(f"  {a:%Y-%m-%d} {len(out)} cycles in {time.perf_counter() - t0:.0f}s", flush=True)
    return out


def sweep(
    segments: list[list[Cycle]], kp3h: pd.Series, grid: list[AlertConfig]
) -> dict[AlertConfig, Score]:
    out = {}
    for cfg in grid:
        total = Score()
        for cycles in segments:
            ticks, events = run_alerts(cycles, cfg)
            total += score(ticks, events, kp3h, cfg)
        out[cfg] = total
    return out


def _report(results: dict[AlertConfig, Score], base: AlertConfig, best: AlertConfig) -> str:
    lines = [
        "# Alert parameter tuning (validation block 2022-24 minus held-out buffers)",
        "",
        "Held-out storms were not used. `false/mo` = WARNINGs with no Kp >= 5- in their window.",
        "Missed = storm onset with no WARNING/ACTIVE held in the 3 h before it.",
        "",
        "| cooldown | p_clear | false/mo | missed | storms | median lead h | events | note |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for c, s in results.items():
        lead = "-" if s.median_lead_h is None else f"{s.median_lead_h:.1f}"
        note = ", ".join(n for n, x in (("baseline", base), ("picked", best)) if c == x)
        lines.append(
            f"| {c.cooldown_cycles} | {c.p_clear} | {s.per_month('false_warnings'):.2f} | "
            f"{s.missed} | {s.storms} | {lead} | {s.events} | {note} |"
        )
    return "\n".join(lines) + "\n"


def main(config: str, jobs: int) -> int:
    cfg = load_cfg(config)
    hold = load_cfg(ROOT / cfg["holdout"])
    omni5 = pd.read_parquet(ROOT / cfg["omni_parquet"])
    kp3h = pd.read_parquet(ROOT / cfg["kp_parquet"])["kp"]
    omni5.index, kp3h.index = _utc(omni5.index), _utc(kp3h.index)
    models_dir = ROOT / cfg["artefact_dir"]
    version = registry.load(models_dir / "stage2_h1.joblib")[0].version
    cache = ROOT / "artefacts" / "alert_tuning" / f"{version}-{model_key(models_dir)}"
    cache.mkdir(parents=True, exist_ok=True)

    segs = val_segments(pd.DatetimeIndex(omni5.index), hold)
    work = [chunks(s) for s in segs]
    n = sum(len(w) for w in work)
    print(f"{len(segs)} segments, {n} weekly chunks, model {version}, {jobs} workers", flush=True)
    t0 = time.perf_counter()
    flat = joblib.Parallel(n_jobs=jobs)(
        joblib.delayed(_chunk_cycles)(omni5, kp3h, models_dir, version, a, b, cache)
        for w in work
        for a, b in w
    )
    print(f"forecasts ready in {(time.perf_counter() - t0) / 60:.1f} min", flush=True)
    # joblib's stubs type results as optional; Parallel returns one list per chunk, in order.
    parts = iter(cast(list[list[Cycle]], flat))
    segments = [[c for _ in w for c in next(parts)] for w in work]

    grid = [
        replace(DEFAULT_CFG, cooldown_cycles=cd, p_clear=pc)
        for cd, pc in product(COOLDOWNS, P_CLEARS)
    ]
    t0 = time.perf_counter()
    results = sweep(segments, kp3h, grid)  # ponytail: serial; parallelise only if this is slow
    print(f"swept {len(grid)} configs in {(time.perf_counter() - t0) / 60:.1f} min", flush=True)
    best = pick(results, DEFAULT_CFG)
    out = ROOT / "docs" / "reports" / "alert-tuning.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(_report(results, DEFAULT_CFG, best), encoding="utf-8")
    print(f"picked cooldown_cycles={best.cooldown_cycles} p_clear={best.p_clear} -> {out}")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    raise SystemExit(main(a.config, a.jobs))
