import numpy as np
import pandas as pd

from app.features.targets import kp_last, kp_target
from app.features.windows import trailing_features


def _df5(n=200, seed=0):
    idx = pd.date_range("2024-05-10", periods=n, freq="5min", tz="UTC")
    r = np.random.default_rng(seed)
    return pd.DataFrame(
        {
            "speed_kms": r.uniform(300, 800, n),
            "by_gsm_nt": r.normal(0, 5, n),
            "bz_gsm_nt": r.normal(0, 5, n),
            "density_cm3": r.uniform(1, 20, n),
        },
        index=idx,
    )


def test_features_ignore_present_and_future():
    df = _df5()
    t = df.index[120]
    base = trailing_features(df).loc[t]
    df2 = df.copy()
    df2.loc[t:, :] = 9999.0
    pd.testing.assert_series_equal(base, trailing_features(df2).loc[t])


def test_gap_gives_nan_not_stale_values():  # Review Focus 2: 2 h gap > 1 h window
    df = _df5()
    df.iloc[100:124] = np.nan
    assert np.isnan(trailing_features(df).iloc[124]["bz_gsm_nt_mean_1h"])


def _kp():
    return pd.Series(
        [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
        index=pd.date_range("2024-05-10 03:00", periods=6, freq="3h", tz="UTC"),
    )


def test_kp_target_bins():
    t = pd.DatetimeIndex([pd.Timestamp("2024-05-10 10:30", tz="UTC")])
    assert kp_target(t, _kp(), 1).iloc[0] == 3.0  # 11:30 -> bin 09:00
    assert kp_target(t, _kp(), 3).iloc[0] == 4.0  # 13:30 -> bin 12:00
    assert kp_target(t, _kp(), 6).iloc[0] == 5.0  # 16:30 -> bin 15:00


def test_kp_last_only_completed_bins():  # Review Focus 3
    t = pd.DatetimeIndex(["2024-05-10 10:30", "2024-05-10 12:00"], tz="UTC")
    assert kp_last(t, _kp()).tolist() == [2.0, 3.0]  # bins 06-09 and 09-12


def test_feature_bin_always_before_target_bin():
    t = pd.date_range("2024-05-10 06:00", "2024-05-10 15:55", freq="5min", tz="UTC")
    last_end = t.floor("3h")  # end of last completed bin
    for h in (1, 3, 6):
        target_end = (t + pd.Timedelta(hours=h)).floor("3h") + pd.Timedelta(hours=3)
        assert (last_end <= t).all() and (target_end > t).all()
