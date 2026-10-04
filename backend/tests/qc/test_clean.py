from datetime import UTC, datetime, timedelta

import numpy as np
import pandas as pd
from app.qc.clean import apply_fill_values, is_stale, range_filter


def test_fill_values_to_nan():
    df = pd.DataFrame(
        {"bz_gsm_nt": [9999.99, -3.0], "speed_kms": [99999.9, 450.0], "density_cm3": [999.99, 5.0]}
    )
    fills = {"bz_gsm_nt": 9999.99, "speed_kms": 99999.9, "density_cm3": 999.99}
    out = apply_fill_values(df, fills)
    assert out.iloc[0].isna().all() and out.iloc[1].tolist() == [-3.0, 450.0, 5.0]


def test_range_filter_spikes():
    df = pd.DataFrame(
        {"speed_kms": [150.0, 450.0, 3500.0], "density_cm3": [-1.0, 5.0, 250.0],
         "bz_gsm_nt": [0.0, -300.0, 10.0]}
    )
    out = range_filter(df)
    assert np.isnan(out.speed_kms[0]) and out.speed_kms[1] == 450.0 and np.isnan(out.speed_kms[2])
    assert np.isnan(out.density_cm3[0]) and np.isnan(out.density_cm3[2])
    assert np.isnan(out.bz_gsm_nt[1])


def test_staleness_boundary():
    t0 = datetime(2024, 5, 10, 10, 0, tzinfo=UTC)
    assert not is_stale(t0, t0 + timedelta(minutes=10))
    assert is_stale(t0, t0 + timedelta(minutes=10, seconds=1))
    assert is_stale(None, t0)
