import numpy as np
import pandas as pd


def split_masks(index: pd.DatetimeIndex, cfg: dict) -> dict[str, np.ndarray]:
    """Time-based train/val/test masks. Held-out storms (+-buffer_days) are excluded from train
    and val; test = held-out storms + everything from test_start."""
    buf = pd.Timedelta(days=cfg["buffer_days"])
    in_storm = np.zeros(len(index), bool)
    in_buf = np.zeros(len(index), bool)
    for s in cfg["storms"]:
        a = pd.Timestamp(s["start"], tz="UTC")
        b = pd.Timestamp(s["end"], tz="UTC") + pd.Timedelta(days=1)
        in_storm |= (index >= a) & (index < b)
        in_buf |= (index >= a - buf) & (index < b + buf)
    val0 = pd.Timestamp(cfg["val_start"], tz="UTC")
    test0 = pd.Timestamp(cfg["test_start"], tz="UTC")
    return {
        "train": np.asarray((index < val0) & ~in_buf),
        "val": np.asarray((index >= val0) & (index < test0) & ~in_buf),
        "test": np.asarray(in_storm | (index >= test0)),
    }
