from pathlib import Path

import pandas as pd
import yaml

from app.features.targets import kp_last, kp_target
from app.features.windows import trailing_features

ROOT = Path(__file__).parents[1]


def load_cfg(path: str | Path) -> dict:
    return yaml.safe_load((ROOT / path).read_text())  # absolute paths pass through


def build(cfg: dict) -> tuple[pd.DataFrame, dict[int, pd.Series]]:
    """Feature frame (OMNI is already bow-shock shifted: no propagation) + Kp target per horizon."""
    omni = pd.read_parquet(ROOT / cfg["omni_parquet"])
    kp3h = pd.read_parquet(ROOT / cfg["kp_parquet"])["kp"]
    idx = pd.DatetimeIndex(omni.index)
    X = trailing_features(omni).assign(kp_last=kp_last(idx, kp3h))
    y = {h: kp_target(idx, kp3h, h) for h in cfg["horizons"]}
    return X, y
