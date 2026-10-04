from pathlib import Path

import numpy as np
import pandas as pd

from app.ingest.gfz_kp import parse_gfz_kp
from app.ingest.omni import parse_omni_hro

FIX = Path(__file__).parents[1] / "fixtures"


def test_gfz_kp():
    s = parse_gfz_kp((FIX / "gfz_kp_small.txt").read_text())
    assert s.index[0] == pd.Timestamp("2024-05-10 15:00", tz="UTC")
    assert s.iloc[0] == 6.667 and s.iloc[1] == 9.0 and np.isnan(s.iloc[2])


def test_omni_hro_columns_and_fill():
    df = parse_omni_hro((FIX / "omni_hro_small.asc").read_text())
    want = {"bx_gsm_nt", "by_gsm_nt", "bz_gsm_nt", "bt_nt", "speed_kms", "density_cm3"}
    assert want <= set(df.columns)
    assert str(df.index.tz) == "UTC"
    assert not (df.abs() >= 999.9).any().any()  # every fill value became NaN
