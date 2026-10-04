"""Replay a named storm through the Stage 2 models and the alert engine (dry-run: nothing is sent).

OMNI is already shifted to the bow shock, so this reuses the training feature path
(ml.dataset.build) and must not go through shift_to_bowshock a second time.
"""

import argparse

import numpy as np
import pandas as pd

from app.alerts.engine import AlertConfig, AlertEvent, AlertState, step
from app.core.constants import HORIZONS_H
from app.models import registry
from app.schemas.forecast import Horizon, KpForecast
from ml.dataset import ROOT, build, load_cfg

STALE_COL = "bz_gsm_nt_mean_30min"  # NaN here means an OMNI gap: treated as stale L1 data


def replay(X: pd.DataFrame, models: dict, cfg: AlertConfig | None = None) -> list[AlertEvent]:
    """One engine step per 5-min row of X. Returns the alert events in time order."""
    cfg = cfg or AlertConfig()
    q = {h: models[h].predict(X) for h in HORIZONS_H}
    stale = X[STALE_COL].isna().to_numpy()
    kp = X["kp_last"].to_numpy(float)
    state, events = AlertState(), []
    for i, t in enumerate(X.index):
        horizons = [Horizon(horizon_h=h, p10=q[h][i, 0], p50=q[h][i, 1], p90=q[h][i, 2]) for h in q]
        fc = KpForecast(
            issued_at=t, model_version="replay", data_stale=bool(stale[i]), horizons=horizons
        )
        state, ev = step(state, fc, None if np.isnan(kp[i]) else float(kp[i]), cfg)
        events += ev
    return events


def main(storm_id: str, config: str = "ml/configs/stage2.yaml") -> None:
    cfg = load_cfg(config)
    storm = next(s for s in load_cfg(ROOT / cfg["holdout"])["storms"] if s["id"] == storm_id)
    X, _ = build(cfg)
    a = pd.Timestamp(storm["start"], tz="UTC") - pd.Timedelta(days=1)
    b = pd.Timestamp(storm["end"], tz="UTC") + pd.Timedelta(days=3)
    X = X.loc[a:b]
    models = {
        h: registry.load(ROOT / cfg["artefact_dir"] / f"stage2_h{h}.joblib")[0] for h in HORIZONS_H
    }
    events = replay(X, models)
    print(f"{storm_id}: {len(X)} cycles from {a:%Y-%m-%d %H:%M} to {b:%Y-%m-%d %H:%M} UTC")
    for e in events:
        kp = "n/a" if e.observed_kp is None else f"{e.observed_kp:.2f}"
        print(
            f"{e.issued_at:%Y-%m-%d %H:%M} UTC  {e.level.value.upper():9s} p={e.p_exceed:.2f}  Kp={kp}"
        )
    print("sequence:", " -> ".join(e.level.value.upper() for e in events) or "(no alerts)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--storm", required=True)
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    args = ap.parse_args()
    main(args.storm, args.config)
