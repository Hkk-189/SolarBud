from typing import ClassVar

import numpy as np
import pandas as pd
from ml.backtest import replay

from app.alerts.engine import Level

HIGH, LOW = (5.0, 5.5, 6.0), (2.0, 3.0, 4.0)  # P(Kp>=4.667) = 0.9 / 0.1


class FakeModel:
    """Test stub: quantiles come from the frame's `high` column (1 = HIGH, 0 = LOW)."""

    columns: ClassVar[list[str]] = ["high"]

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return np.array([HIGH if h else LOW for h in X["high"]])


MODELS = {1: FakeModel(), 3: FakeModel(), 6: FakeModel()}


def frame(rows):
    """rows: list of (high, kp_last, bz). One row per 5-min cycle."""
    idx = pd.date_range("2024-05-10", periods=len(rows), freq="5min", tz="UTC")
    high, kp, bz = zip(*rows)
    return pd.DataFrame({"high": high, "kp_last": kp, "bz_gsm_nt_mean_30min": bz}, index=idx)


def levels(events):
    return [e.level for e in events]


def test_storm_replays_warning_active_all_clear():
    rows = (
        [(0, 2.0, -1.0)] * 3 + [(1, 3.0, -15.0)] * 2 + [(1, 5.0, -20.0)] * 2 + [(0, 3.0, 1.0)] * 3
    )
    assert levels(replay(frame(rows), MODELS)) == [Level.WARNING, Level.ACTIVE, Level.ALL_CLEAR]


def test_l1_gap_is_stale_and_never_escalates():
    rows = [(1, 3.0, np.nan)] * 5
    assert replay(frame(rows), MODELS) == []


def test_missing_kp_is_not_active_and_does_not_crash():
    rows = [(1, np.nan, -15.0)] * 3
    ev = replay(frame(rows), MODELS)
    assert levels(ev) == [Level.WARNING] and ev[0].observed_kp is None


def test_event_time_is_the_cycle_time():
    ev = replay(frame([(1, 3.0, -15.0)] * 2), MODELS)
    assert ev[0].issued_at == pd.Timestamp("2024-05-10 00:05", tz="UTC")
