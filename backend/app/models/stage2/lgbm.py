import lightgbm as lgb
import numpy as np

QUANTILES = (0.1, 0.5, 0.9)


class QuantileKp:
    """p10/p50/p90 LightGBM models for one horizon."""

    version = "stage2-lgbm-0.1.0"

    def __init__(self, seed: int = 0, n_jobs: int = 1, **params):
        self.columns: list[str] = []
        self.models = [
            lgb.LGBMRegressor(
                objective="quantile",
                alpha=q,
                random_state=seed,
                deterministic=True,
                n_jobs=n_jobs,
                verbose=-1,
                **params,
            )
            for q in QUANTILES
        ]

    def fit(self, X, y, **fit_kwargs) -> "QuantileKp":
        self.columns = list(X.columns)
        for m in self.models:
            m.fit(X, y, **fit_kwargs)
        return self

    def predict(self, X) -> np.ndarray:
        X = X.reindex(columns=self.columns) if self.columns else X
        # sort per row: independently trained quantiles can cross
        return np.sort(np.column_stack([np.asarray(m.predict(X)) for m in self.models]), axis=1)


def p_exceed(q: np.ndarray, thr: float) -> np.ndarray:
    """P(Kp >= thr) per row from sorted (p10, p50, p90): linear CDF between quantiles, flat tails.

    ponytail: crude CDF, so tails are capped at 10%/90%. Replace with conformal calibration (Phase 4).
    """
    q0, q1, q2 = (np.asarray(q, float)[:, i] for i in range(3))
    with np.errstate(divide="ignore", invalid="ignore"):  # tied quantiles hit unused branches
        cdf = np.where(
            thr <= q0,
            0.1,
            np.where(
                thr <= q1,
                0.1 + 0.4 * (thr - q0) / (q1 - q0),
                np.where(thr <= q2, 0.5 + 0.4 * (thr - q1) / (q2 - q1), 0.9),
            ),
        )
    return 1 - cdf
