"""The ONE shared evaluation script: persistence, Newell-Kp baseline and LightGBM on the test split."""

import argparse
from datetime import UTC, datetime

import numpy as np
import pandas as pd

from app.models import registry
from app.models.stage2.baselines import persistence
from ml.dataset import ROOT, build, load_cfg
from ml.splits import split_masks

THRESHOLDS = {"Kp>=5": 4.667, "Kp>=7": 6.667}  # G1 / G3 (5- / 7-)


def _div(a, b):
    return a / b if b else float("nan")


def contingency(obs, pred, thr: float) -> dict:
    """Event skill at a Kp threshold. Empty denominators give NaN, never ZeroDivisionError."""
    o, p = np.asarray(obs) >= thr - 1e-3, np.asarray(pred) >= thr - 1e-3
    tp, fn = int((o & p).sum()), int((o & ~p).sum())
    fp, tn = int((~o & p).sum()), int((~o & ~p).sum())
    pod, pofd = _div(tp, tp + fn), _div(fp, fp + tn)
    hss = _div(2 * (tp * tn - fn * fp), (tp + fn) * (fn + tn) + (tp + fp) * (fp + tn))
    return {"POD": pod, "FAR": _div(fp, tp + fp), "TSS": pod - pofd, "HSS": hss}


def coverage(y, lo, hi) -> float:
    y = np.asarray(y)
    return float(np.mean((y >= np.asarray(lo)) & (y <= np.asarray(hi))))


def skill(rmse_model: float, rmse_ref: float) -> float:
    return 1 - rmse_model / rmse_ref


def _rmse(a, b) -> float:
    return float(np.sqrt(np.mean((np.asarray(a) - np.asarray(b)) ** 2)))


def main(config: str) -> None:
    cfg = load_cfg(config)
    X, ys = build(cfg)
    test = split_masks(pd.DatetimeIndex(X.index), load_cfg(ROOT / cfg["holdout"]))["test"]
    rows, lines = [], []
    for h, y in ys.items():
        ok = test & y.notna().to_numpy() & X["kp_last"].notna().to_numpy()
        Xt, yt = X[ok], y[ok].to_numpy()
        model, _ = registry.load(ROOT / cfg["artefact_dir"] / f"stage2_h{h}.joblib")
        newell, _ = registry.load(ROOT / cfg["artefact_dir"] / f"newell_h{h}.joblib")
        q = model.predict(Xt)
        preds = {
            "persistence": persistence(Xt["kp_last"]),
            "newell-kp": newell.predict(Xt["newell_mean_3h"]),
            "lgbm-p50": q[:, 1],
        }
        # score every model on the same rows: the Newell baseline is NaN where its window has gaps
        same = np.all([np.isfinite(v) for v in preds.values()], axis=0)
        preds = {k: v[same] for k, v in preds.items()}
        yt, q = yt[same], q[same]
        ref = _rmse(preds["persistence"], yt)
        for name, p in preds.items():
            ev = {k: contingency(yt, p, t) for k, t in THRESHOLDS.items()}
            rows.append(
                (
                    h,
                    name,
                    _rmse(p, yt),
                    float(np.mean(np.abs(p - yt))),
                    skill(_rmse(p, yt), ref),
                    ev["Kp>=5"]["TSS"],
                    ev["Kp>=5"]["HSS"],
                    ev["Kp>=7"]["TSS"],
                )
            )
        lines.append(
            f"- +{h} h: n={len(yt)}, 80% interval coverage = {coverage(yt, q[:, 0], q[:, 2]):.2f}"
        )
    head = "| h | model | RMSE | MAE | skill vs persistence | TSS Kp>=5 | HSS Kp>=5 | TSS Kp>=7 |\n|---|---|---|---|---|---|---|---|\n"
    table = head + "\n".join(
        f"| +{r[0]} | {r[1]} | {r[2]:.3f} | {r[3]:.3f} | {r[4]:+.3f} | {r[5]:.2f} | {r[6]:.2f} | {r[7]:.2f} |"
        for r in rows
    )
    text = (
        f"# Stage 2 model card (LightGBM quantile)\n\nGenerated {datetime.now(UTC):%Y-%m-%d} on the test split (held-out storms + 2025 onward).\n\n{table}\n\n"
        + "\n".join(lines)
        + "\n"
    )
    print(text)
    (ROOT / "docs" / "model-cards").mkdir(parents=True, exist_ok=True)
    (ROOT / "docs" / "model-cards" / "stage2-lgbm.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    main(ap.parse_args().config)
