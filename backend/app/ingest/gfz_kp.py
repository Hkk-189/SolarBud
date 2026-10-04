import io

import numpy as np
import pandas as pd


def parse_gfz_kp(text: str) -> pd.Series:
    """GFZ Kp_ap_since_1932.txt -> Kp (thirds as floats) indexed by 3 h bin START, UTC."""
    raw = pd.read_csv(io.StringIO(text), sep=r"\s+", comment="#", header=None)
    start = pd.to_datetime(raw[[0, 1, 2]].rename(columns={0: "year", 1: "month", 2: "day"}))
    idx = pd.DatetimeIndex(start + pd.to_timedelta(raw[3], unit="h"), name="time").tz_localize("UTC")
    kp = raw[7].astype(float).where(raw[7] >= 0, np.nan)  # -1.000 marks missing
    return pd.Series(kp.to_numpy(), index=idx, name="kp")
