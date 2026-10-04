import lightgbm as lgb
import numpy as np

QUANTILES = (0.1, 0.5, 0.9)


class QuantileKp:
    """p10/p50/p90 LightGBM models for one horizon."""

    version = "stage2-lgbm-0.1.0"

    def __init__(self, seed: int = 0, **params):
        self.columns: list[str] = []
        self.models = [
            lgb.LGBMRegressor(
                objective="quantile",
                alpha=q,
                random_state=seed,
                deterministic=True,
                n_jobs=1,
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
