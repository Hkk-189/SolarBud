from dataclasses import dataclass

import numpy as np


def persistence(kp_last) -> np.ndarray:
    return np.asarray(kp_last, dtype=float)


@dataclass
class NewellKp:
    """Physics baseline: Kp ~ a + b * mean Newell coupling. Fit on the train split only."""

    a: float = 0.0
    b: float = 0.0

    def fit(self, x, y) -> "NewellKp":
        x, y = np.asarray(x, float), np.asarray(y, float)
        ok = ~(np.isnan(x) | np.isnan(y))
        self.b, self.a = np.polyfit(x[ok], y[ok], 1)
        return self

    def predict(self, x) -> np.ndarray:
        return self.a + self.b * np.asarray(x, float)
