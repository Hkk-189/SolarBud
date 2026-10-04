import argparse
import subprocess
from pathlib import Path

import lightgbm as lgb
import numpy as np

from app.models import registry
from app.models.stage2.baselines import NewellKp
from app.models.stage2.lgbm import QuantileKp
from ml.dataset import ROOT, build, load_cfg
from ml.splits import split_masks

NEWELL_COL = "newell_mean_3h"


def _sha() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    except Exception:
        return "unknown"


def main(config: str) -> None:
    cfg = load_cfg(config)
    hold = load_cfg(ROOT / cfg["holdout"])
    X, ys = build(cfg)
    m = split_masks(X.index, hold)
    out = ROOT / cfg["artefact_dir"]
    for h, y in ys.items():
        ok = y.notna().to_numpy() & X["kp_last"].notna().to_numpy()
        tr, va = m["train"] & ok, m["val"] & ok
        rng = (str(X.index[tr].min()), str(X.index[tr].max()))
        newell = NewellKp().fit(X.loc[tr, NEWELL_COL], y[tr])
        model = QuantileKp(seed=cfg["seed"], **cfg["lgbm"]).fit(
            X[tr], y[tr], eval_set=[(X[va], y[va])],
            callbacks=[lgb.early_stopping(50, verbose=False)],
        )
        val_rmse = float(np.sqrt(np.mean((model.predict(X[va])[:, 1] - y[va]) ** 2)))
        meta = {"config": cfg, "data_range": list(rng), "git_sha": _sha(),
                "metrics": {"val_rmse_p50": val_rmse}, "horizon_h": h}
        registry.save(model, meta, out / f"stage2_h{h}.joblib")
        registry.save(newell, meta, out / f"newell_h{h}.joblib")
        print(f"h={h}: train rows={int(tr.sum())} val rows={int(va.sum())} val_rmse={val_rmse:.3f}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    main(ap.parse_args().config)
