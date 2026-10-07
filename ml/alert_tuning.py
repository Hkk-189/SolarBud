"""Choose alert parameters on the validation block. Never run this on held-out storms to tune.

Forecasts do not depend on AlertConfig, so the expensive part (`ml.backtest.forecast_stream`) is
computed once per segment and every grid point only re-runs the state machine.
"""

import argparse
import hashlib
import time
from collections import Counter
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
P_THRESHOLDS = (0.5, 0.4, 0.3)
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
    """Content hash of the Stage 2 artefacts, so a retrain never reuses stale cached forecasts.

    It does not cover the input parquets or the feature code: delete artefacts/alert_tuning/ after a re-ingest.
    """
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


def grid() -> list[AlertConfig]:
    """cooldown x p_clear x p_threshold, keeping the hysteresis gap p_clear < p_threshold."""
    return [
        replace(DEFAULT_CFG, cooldown_cycles=cd, p_clear=pc, p_threshold=pt)
        for pt, cd, pc in product(P_THRESHOLDS, COOLDOWNS, P_CLEARS)
        if pc < pt
    ]


def pareto(results: dict[AlertConfig, Score]) -> set[AlertConfig]:
    """Configs that no other config beats on both missed storms and false warnings."""

    def beats(a: Score, b: Score) -> bool:
        return (
            a.missed <= b.missed
            and a.false_warnings <= b.false_warnings
            and (a.missed, a.false_warnings) != (b.missed, b.false_warnings)
        )

    return {c for c, s in results.items() if not any(beats(o, s) for o in results.values())}


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


def _report(
    results: dict[AlertConfig, Score], base: AlertConfig, best: AlertConfig, front: set[AlertConfig]
) -> str:
    lines = [
        "# Alert parameter tuning (validation block 2022-24 minus held-out buffers)",
        "",
        "Held-out storms were not used. `false/mo` = WARNINGs with no Kp >= 5- in their window.",
        "Missed = storm onset with no WARNING/ACTIVE held in the 3 h before it. Miss kinds: late =",
        "WARNING inside the onset bin (still before ACTIVE); stale = mostly stale L1 before onset;",
        "rose = P rose above p_clear but no WARNING in time; flat = P stayed at or below p_clear.",
        "frontier = no other row is at least as good on both misses and false warnings and better on one.",
        "",
        (
            "| p_threshold | cooldown | p_clear | false/mo | missed | late | stale | rose | flat "
            "| median lead h | events | note |"
        ),
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    rows = sorted(results.items(), key=lambda kv: (-kv[0].p_threshold, kv[1].false_warnings))
    for c, s in rows:
        k = Counter(s.miss_kinds)
        lead = "-" if s.median_lead_h is None else f"{s.median_lead_h:.1f}"
        marks = (("baseline", c == base), ("rule pick", c == best), ("frontier", c in front))
        note = ", ".join(n for n, hit in marks if hit)
        lines.append(
            f"| {c.p_threshold} | {c.cooldown_cycles} | {c.p_clear} | "
            f"{s.per_month('false_warnings'):.2f} | {s.missed} | {k['late']} | {k['stale']} | "
            f"{k['rose']} | {k['flat']} | {lead} | {s.events} | {note} |"
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

    configs = grid()
    t0 = time.perf_counter()
    results = sweep(segments, kp3h, configs)  # ponytail: serial; parallelise only if this is slow
    print(f"swept {len(configs)} configs in {(time.perf_counter() - t0) / 60:.1f} min", flush=True)
    best = pick(results, DEFAULT_CFG)
    front = pareto(results)
    out = ROOT / "docs" / "reports" / "alert-tuning.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(_report(results, DEFAULT_CFG, best, front), encoding="utf-8")
    print(f"-> {out}")
    print(f"rule pick: {best}")
    for c in sorted(front, key=lambda c: -c.p_threshold):
        s = results[c]
        print(
            f"frontier p_thr={c.p_threshold} cd={c.cooldown_cycles} p_clear={c.p_clear}: "
            f"missed {s.missed}, false/mo {s.per_month('false_warnings'):.2f}"
        )
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    raise SystemExit(main(a.config, a.jobs))
