import numpy as np
import pandas as pd
from app.workers.scheduler import run_forecast_cycle


class Fake:
    version = "test"

    def predict(self, X):
        return np.tile([4.0, 5.0, 6.0], (len(X), 1))


def _sw(end):
    idx = pd.date_range(end=end, periods=8 * 60, freq="1min", tz="UTC")
    return pd.DataFrame(
        {"speed_kms": 500.0, "density_cm3": 5.0, "bx_gsm_nt": 0.0, "by_gsm_nt": 0.0,
         "bz_gsm_nt": -10.0, "bt_nt": 10.0},
        index=idx,
    )


def test_cycle_fresh_and_stale():
    now = pd.Timestamp("2024-05-10 18:00", tz="UTC")
    kp = pd.Series([3.0], index=[pd.Timestamp("2024-05-10 12:00", tz="UTC")])
    models = {h: Fake() for h in (1, 3, 6)}
    fresh = run_forecast_cycle(_sw(now), kp, now.to_pydatetime(), models)
    assert fresh["data_stale"] is False
    assert [h["horizon_h"] for h in fresh["horizons"]] == [1, 3, 6]
    late = now - pd.Timedelta(minutes=11)
    stale = run_forecast_cycle(_sw(late), kp, now.to_pydatetime(), models)
    assert stale["data_stale"] is True
