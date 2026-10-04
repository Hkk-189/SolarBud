import json
from pathlib import Path

import httpx
import numpy as np
import pandas as pd
from app.ingest.swpc import PLASMA_COLUMNS, fetch_json, parse_swpc_table

FIX = Path(__file__).parents[1] / "fixtures"


def test_parse_plasma_header_nulls_utc():
    rows = json.loads((FIX / "swpc_plasma_small.json").read_text())
    df = parse_swpc_table(rows, PLASMA_COLUMNS)
    assert list(df.columns) == ["density_cm3", "speed_kms"]
    assert str(df.index.tz) == "UTC"
    assert df.index[0] == pd.Timestamp("2024-05-10 17:00", tz="UTC")
    assert np.isnan(df.density_cm3.iloc[1]) and np.isnan(df.speed_kms.iloc[2])
    assert df.speed_kms.iloc[0] == 400.2


def test_parse_header_only_is_empty():  # Review Focus 1
    df = parse_swpc_table([["time_tag", "density", "speed", "temperature"]], PLASMA_COLUMNS)
    assert df.empty and list(df.columns) == ["density_cm3", "speed_kms"]


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
    transport = httpx.MockTransport(lambda r: httpx.Response(200, json=[["a"]]))
    async with httpx.AsyncClient(transport=transport) as c:
        assert await fetch_json(c, "https://x/y.json", backoff_s=0) == [["a"]]
