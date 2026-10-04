from datetime import datetime

import numpy as np
import pandas as pd

from app.core.constants import B_MAX_NT, STALE_AFTER, VALID_RANGES


def apply_fill_values(df: pd.DataFrame, fills: dict[str, float]) -> pd.DataFrame:
    out = df.copy()
    for col, fill in fills.items():
        if col in out:
            out.loc[out[col].abs() >= fill - 1e-6, col] = np.nan
    return out


def range_filter(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col, (lo, hi) in VALID_RANGES.items():
        if col in out:
            out[col] = out[col].where(out[col].between(lo, hi))
    for col in [c for c in out if c.endswith("_nt")]:
        out[col] = out[col].where(out[col].abs() <= B_MAX_NT)
    return out


def is_stale(last: datetime | None, now: datetime) -> bool:
    return last is None or now - last > STALE_AFTER
