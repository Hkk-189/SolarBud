import pandas as pd

from app.core.constants import L1_TO_BOWSHOCK_KM


def shift_to_bowshock(df: pd.DataFrame) -> pd.DataFrame:
    """Shift SWPC L1 rows to the bow shock by distance/speed. OMNI is already shifted: never
    call this on OMNI data or twice on the same frame."""
    d = df.dropna(subset=["speed_kms"])
    t = d.index + pd.to_timedelta(L1_TO_BOWSHOCK_KM / d["speed_kms"], unit="s")
    out = d.set_axis(t).sort_index()
    return out[~out.index.duplicated(keep="last")]
