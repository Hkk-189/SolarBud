import pandas as pd

BIN = pd.Timedelta("3h")


def kp_last(index: pd.DatetimeIndex, kp3h: pd.Series) -> pd.Series:
    """Kp of the last COMPLETED 3 h bin at each time (bin start = floor(t, 3h) - 3h)."""
    return pd.Series(kp3h.reindex(index.floor("3h") - BIN).to_numpy(), index=index, name="kp_last")


def kp_target(index: pd.DatetimeIndex, kp3h: pd.Series, horizon_h: int) -> pd.Series:
    """Kp of the 3 h bin containing t + horizon."""
    when = (index + pd.Timedelta(hours=horizon_h)).floor("3h")
    return pd.Series(kp3h.reindex(when).to_numpy(), index=index, name=f"kp_h{horizon_h}")
