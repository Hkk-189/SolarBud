import pandas as pd

from app.features.physics import add_physics

WINDOWS = ("30min", "1h", "3h", "6h")
COLS = ["bz_gsm_nt", "speed_kms", "density_cm3", "ey_mvm", "pdyn_npa", "newell"]
CADENCE = pd.Timedelta("5min")


def trailing_features(df5: pd.DataFrame) -> pd.DataFrame:
    """Trailing-only (closed='left') window stats on a 5-min frame. Row t never sees t or later.
    A window needs at least half its samples, so a gap longer than half a window gives NaN."""
    d = add_physics(df5)
    parts: dict[str, pd.Series] = {}
    for w in WINDOWS:
        need = max(1, pd.Timedelta(w) // CADENCE // 2)
        r = d[COLS].rolling(w, closed="left", min_periods=need)
        mean, bz = r.mean(), d["bz_gsm_nt"].rolling(w, closed="left", min_periods=need)
        for c in COLS:
            parts[f"{c}_mean_{w}"] = mean[c]
        parts[f"bz_gsm_nt_min_{w}"] = bz.min()
        parts[f"bz_gsm_nt_std_{w}"] = bz.std()
    south = (d["bz_gsm_nt"] < 0).where(d["bz_gsm_nt"].notna()).astype(float)
    parts["south_minutes_3h"] = south.rolling("3h", closed="left", min_periods=18).sum() * 5
    return pd.DataFrame(parts, index=d.index)
