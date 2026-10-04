"""NOAA SWPC real-time solar wind (RTSW) client and parser.

Feeds: json/rtsw/rtsw_wind_1m.json and rtsw_mag_1m.json — newest-first lists of dict records,
one per observation, from several spacecraft at once. Only rows with active=true are the
operational source; timestamps are UTC without a 'Z'.
"""

import asyncio
import logging

import httpx
import pandas as pd

log = logging.getLogger(__name__)

PLASMA_COLUMNS = {"proton_density": "density_cm3", "proton_speed": "speed_kms"}
MAG_COLUMNS = {
    "bx_gsm": "bx_gsm_nt", "by_gsm": "by_gsm_nt", "bz_gsm": "bz_gsm_nt", "bt": "bt_nt",
}


def parse_rtsw(records: list[dict], columns: dict[str, str]) -> pd.DataFrame:
    """Active-source rows -> UTC-indexed, ascending, de-duplicated frame (+ source column)."""
    out_cols = [*columns.values(), "source"]
    rows = [r for r in records if r.get("active")]
    if not rows:
        return pd.DataFrame(columns=out_cols, index=pd.DatetimeIndex([], tz="UTC", name="time"))
    df = pd.DataFrame(rows)
    idx = pd.DatetimeIndex(pd.to_datetime(df["time_tag"], utc=True), name="time")
    num = df.reindex(columns=list(columns)).apply(pd.to_numeric, errors="coerce")
    out = num.rename(columns=columns).assign(source=df["source"].to_numpy()).set_axis(idx)
    out = out.sort_index()
    return out[~out.index.duplicated(keep="last")]


async def fetch_json(
    client: httpx.AsyncClient, url: str, tries: int = 3, backoff_s: float = 2.0
) -> list[dict] | None:
    """GET json with retry/backoff. Never raises: returns None so the caller marks stale."""
    for i in range(tries):
        try:
            r = await client.get(url, timeout=10)
            r.raise_for_status()
            return r.json()
        except (httpx.HTTPError, ValueError) as e:
            log.warning("fetch failed", extra={"url": url, "attempt": i + 1, "err": str(e)})
            await asyncio.sleep(backoff_s * 2**i)
    return None
