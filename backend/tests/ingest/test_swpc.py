import json
from pathlib import Path

import httpx
import numpy as np
import pandas as pd
from app.ingest.swpc import PLASMA_COLUMNS, fetch_json, parse_rtsw, parse_swpc_kp

FIX = Path(__file__).parents[1] / "fixtures"
COLS = ["density_cm3", "speed_kms", "source"]


def test_parse_plasma_active_only_sorted_utc_nulls():
    df = parse_rtsw(json.loads((FIX / "swpc_plasma_small.json").read_text()), PLASMA_COLUMNS)
    assert list(df.columns) == COLS
    assert str(df.index.tz) == "UTC" and df.index.is_monotonic_increasing and df.index.is_unique
    assert df.index[0] == pd.Timestamp("2024-05-10 17:00", tz="UTC")
    assert len(df) == 3 and set(df.source) == {"SOLAR1"}  # inactive ACE row at 17:01 dropped
    assert df.speed_kms.iloc[0] == 400.2 and df.speed_kms.iloc[1] == 401.0  # not the ACE 999.0
    assert np.isnan(df.density_cm3.iloc[1]) and np.isnan(df.speed_kms.iloc[2])


def test_parse_empty_or_all_inactive_is_empty():  # Review Focus 1
    assert parse_rtsw([], PLASMA_COLUMNS).empty
    inactive = [{"time_tag": "2024-05-10T17:00:00", "active": False, "source": "ACE",
                 "proton_speed": 400.0, "proton_density": 5.0}]
    df = parse_rtsw(inactive, PLASMA_COLUMNS)
    assert df.empty and list(df.columns) == COLS


async def test_fetch_json_never_raises_on_500():
    calls = 0

    def handler(req):
        nonlocal calls
        calls += 1
        return httpx.Response(500)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        assert await fetch_json(c, "https://x/y.json", backoff_s=0) is None
    assert calls == 3


async def test_fetch_json_ok():
    transport = httpx.MockTransport(lambda r: httpx.Response(200, json=[{"a": 1}]))
    async with httpx.AsyncClient(transport=transport) as c:
        assert await fetch_json(c, "https://x/y.json", backoff_s=0) == [{"a": 1}]


def test_parse_swpc_kp():
    recs = [{"time_tag": "2026-09-27T03:00:00", "Kp": 3.33, "a_running": 18, "station_count": 8},
            {"time_tag": "2026-09-27T00:00:00", "Kp": 4.0, "a_running": 27, "station_count": 8}]
    s = parse_swpc_kp(recs)
    assert s.index[0] == pd.Timestamp("2026-09-27 00:00", tz="UTC") and s.tolist() == [4.0, 3.33]
    assert parse_swpc_kp([]).empty
