import numpy as np
import pandas as pd

from app.features.propagation import shift_to_bowshock


def _df(speeds):
    idx = pd.date_range("2024-05-10 10:00", periods=len(speeds), freq="1min", tz="UTC")
    return pd.DataFrame({"speed_kms": speeds, "bz_gsm_nt": -5.0}, index=idx)


def test_constant_speed_shift():  # 1.436e6 km / 400 km/s = 3590 s
    out = shift_to_bowshock(_df([400.0] * 20))
    assert out.index[0] == pd.Timestamp("2024-05-10 10:00", tz="UTC") + pd.Timedelta(seconds=3590)


def test_nan_speed_rows_dropped():
    assert len(shift_to_bowshock(_df([400.0, np.nan, 400.0]))) == 2


def test_overtaking_keeps_index_monotonic():  # a fast row overtakes slower rows
    out = shift_to_bowshock(_df([300.0] * 10 + [800.0] * 10))
    assert out.index.is_monotonic_increasing and out.index.is_unique
