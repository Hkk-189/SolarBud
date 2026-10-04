import io

import pandas as pd

from app.qc.clean import apply_fill_values

# 0-based whitespace-separated columns of the OMNI HRO 1-min format (hroformat.txt)
_COLS = {
    13: "bt_nt",
    14: "bx_gsm_nt",
    17: "by_gsm_nt",
    18: "bz_gsm_nt",
    21: "speed_kms",
    25: "density_cm3",
}
_FILLS = {
    "bt_nt": 9999.99,
    "bx_gsm_nt": 9999.99,
    "by_gsm_nt": 9999.99,
    "bz_gsm_nt": 9999.99,
    "speed_kms": 99999.9,
    "density_cm3": 999.99,
}


def parse_omni_hro(text: str) -> pd.DataFrame:
    """OMNI HRO 1-min text -> GSM frame, UTC index, fill values -> NaN. Already bow-shock shifted."""
    raw = pd.read_csv(io.StringIO(text), sep=r"\s+", header=None)
    t = (
        pd.to_datetime(raw[0].astype(str), format="%Y")
        + pd.to_timedelta(raw[1] - 1, unit="D")
        + pd.to_timedelta(raw[2], unit="h")
        + pd.to_timedelta(raw[3], unit="m")
    )
    df = raw[list(_COLS)].rename(columns=_COLS).astype(float)
    df.index = pd.DatetimeIndex(t, name="time").tz_localize("UTC")
    return apply_fill_values(df, _FILLS)
