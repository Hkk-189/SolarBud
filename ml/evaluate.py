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


def _score(yt, preds: dict, ref: float) -> list[tuple]:
    """One row per model: RMSE, MAE, skill vs persistence and event skill per threshold."""
    return [
        (
            name,
            _rmse(p, yt),
            float(np.mean(np.abs(p - yt))),
            skill(_rmse(p, yt), ref),
            {k: contingency(yt, p, t) for k, t in THRESHOLDS.items()},
        )
        for name, p in preds.items()
    ]


def main(config: str) -> None:
    cfg = load_cfg(config)
    X, ys = build(cfg)
    hold = load_cfg(ROOT / cfg["holdout"])
    idx = pd.DatetimeIndex(X.index)
    test = split_masks(idx, hold)["test"]
    rows, lines, storm_rows = [], [], []
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
        yt, q, tidx = yt[same], q[same], idx[ok][same]
        ref = _rmse(preds["persistence"], yt)
        for name, r, m, sk, ev in _score(yt, preds, ref):
            rows.append((h, name, r, m, sk, ev))
        lines.append(
            f"- +{h} h: n={len(yt)}, 80% interval coverage = {coverage(yt, q[:, 0], q[:, 2]):.2f}"
        )
        for s in hold["storms"]:
            a = pd.Timestamp(s["start"], tz="UTC")
            m = (tidx >= a) & (tidx < pd.Timestamp(s["end"], tz="UTC") + pd.Timedelta(days=1))
            if m.sum() == 0:
                continue
            sp = {k: v[m] for k, v in preds.items()}
            r0 = _rmse(sp["persistence"], yt[m])
            for name, r, _, _, ev in _score(yt[m], sp, r0):
                storm_rows.append((s["id"], h, name, r, ev["Kp>=5"]["POD"], ev["Kp>=5"]["TSS"]))

    def md(header: str, body: list[str]) -> str:
        cols = header.count("|") - 1
        return chr(10).join([header, "|" + "---|" * cols, *body])

    table = md(
        "| h | model | RMSE | MAE | skill vs persistence | POD Kp>=5 | FAR Kp>=5 | TSS Kp>=5 "
        "| HSS Kp>=5 | POD Kp>=7 | TSS Kp>=7 |",
        [
            f"| +{h} | {n} | {r:.3f} | {m:.3f} | {sk:+.3f} | {e['Kp>=5']['POD']:.2f} "
            f"| {e['Kp>=5']['FAR']:.2f} | {e['Kp>=5']['TSS']:.2f} | {e['Kp>=5']['HSS']:.2f} "
            f"| {e['Kp>=7']['POD']:.2f} | {e['Kp>=7']['TSS']:.2f} |"
            for h, n, r, m, sk, e in rows
        ],
    )
    storm_tab = md(
        "| storm | h | model | RMSE | POD Kp>=5 | TSS Kp>=5 |",
        [
            f"| {s} | +{h} | {n} | {r:.3f} | {pod:.2f} | {tss:.2f} |"
            for s, h, n, r, pod, tss in storm_rows
        ],
    )
    nl = chr(10)
    text = (
        "# Stage 2 model card (LightGBM quantile)"
        + nl
        + nl
        + f"Generated {datetime.now(UTC):%Y-%m-%d} on the test split (held-out storms + 2025 onward)."
        + nl
        + nl
        + table
        + nl
        + nl
        + nl.join(lines)
        + nl
        + nl
        + "## Per held-out storm"
        + nl
        + nl
        + storm_tab
        + nl
    )
    print(text)
    (ROOT / "docs" / "model-cards").mkdir(parents=True, exist_ok=True)
    (ROOT / "docs" / "model-cards" / "stage2-lgbm.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="ml/configs/stage2.yaml")
    main(ap.parse_args().config)
