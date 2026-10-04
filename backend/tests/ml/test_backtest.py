"""Replay spec. Synthetic 5-min L1 frame + scripted fake models; no data or artefacts needed.

Hand-computed with G1 (kp_threshold 4.667), engine cadence 2 up / 3 down, one cycle per 5 min:
  HIGH q=(5.0, 5.5, 6.0) -> P = 0.9, LOW q=(2.0, 3.0, 4.0) -> P = 0.1.
  kp_last(t) is the bin starting at floor(t, 3h) - 3h, so the bin starting 06:00 is first seen at 09:00.
"""

import numpy as np
import pandas as pd
import pytest
from ml.backtest import replay, summarise

from app.alerts.engine import Level

HIGH, LOW = (5.0, 5.5, 6.0), (2.0, 3.0, 4.0)
D = "2024-05-10"


def ts(hhmm: str, day: str = D) -> pd.Timestamp:
    return pd.Timestamp(f"{day} {hhmm}", tz="UTC")


class Fake:
    version = "test"

    def __init__(self, fn):
        self.fn = fn

    def predict(self, X):
        return np.tile(self.fn(X.index[0]), (len(X), 1))


def models(fn):
    return {h: Fake(fn) for h in (1, 3, 6)}


def omni(gap=None):
    idx = pd.date_range(ts("00:00"), ts("00:00", "2024-05-11"), freq="5min")
    df = pd.DataFrame(
        {
            "speed_kms": 500.0,
            "density_cm3": 5.0,
            "bx_gsm_nt": 0.0,
            "by_gsm_nt": 0.0,
            "bz_gsm_nt": -10.0,
            "bt_nt": 10.0,
        },
        index=idx,
    )
    if gap:
        df.loc[gap[0] : gap[1], ["speed_kms", "bz_gsm_nt"]] = np.nan
    return df


def kp(**bins: float) -> pd.Series:
    """Quiet Kp 2.0 everywhere, overrides keyed by bin start hour, e.g. kp(h06=6.0)."""
    s = pd.Series(2.0, index=pd.date_range(ts("00:00"), periods=8, freq="3h"))
    for k, v in bins.items():
        s[ts(f"{k[1:]}:00")] = v
    return s


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
def test_quiet_no_events():
    ticks, events = replay(omni(), kp(), ts("12:00"), ts("14:00"), models(lambda t: LOW))
    assert events == []
    assert all(t.level == Level.NONE for t in ticks)
    assert len(ticks) == 25


def test_high_p_warns_on_second_cycle():
    ticks, events = replay(omni(), kp(), ts("08:00"), ts("09:00"), models(lambda t: HIGH))
    assert levels(events) == [Level.WARNING]
    assert events[0].issued_at == ts("08:05")
    assert ticks[0].level == Level.NONE and ticks[1].level == Level.WARNING


def test_warning_active_all_clear_sequence():
    fn = lambda t: HIGH if t < ts("12:00") else LOW
    k = kp(h06=6.0)  # first completed at 09:00; the 09:00 bin is quiet and completes at 12:00
    ticks, events = replay(omni(), k, ts("08:00"), ts("13:00"), models(fn))
    assert levels(events) == [Level.WARNING, Level.ACTIVE, Level.ALL_CLEAR]
    assert [e.issued_at for e in events] == [ts("08:05"), ts("09:00"), ts("12:10")]
    s = summarise(ticks, events, k)
    assert s["sequence_ok"] is True
    assert s["first_warning"] == ts("08:05") and s["first_active"] == ts("09:00")
    assert s["all_clear"] == ts("12:10")


def test_stale_gap_blocks_escalation():
    gap = (ts("07:00"), ts("08:55"))
    ticks, events = replay(omni(gap), kp(), ts("08:00"), ts("09:30"), models(lambda t: HIGH))
    assert all(t.stale for t in ticks if t.t < ts("09:05"))
    assert not ticks[-1].stale
    assert levels(events) == [Level.WARNING]
    assert events[0].issued_at == ts("09:10")  # first fresh cycle 09:05, second 09:10


def test_warning_without_storm_is_false_warning():
    fn = lambda t: HIGH if t < ts("08:10") else LOW
    ticks, events = replay(omni(), kp(), ts("08:00"), ts("09:00"), models(fn))
    assert levels(events) == [Level.WARNING, Level.ALL_CLEAR]
    s = summarise(ticks, events, kp())
    assert s["false_warnings"] == 1 and s["sequence_ok"] is False


def test_lead_time_vs_observed_onset():
    k = kp(h06=6.0)
    ticks, events = replay(omni(), k, ts("04:00"), ts("05:00"), models(lambda t: HIGH))
    s = summarise(ticks, events, k)
    assert s["first_obs_g1"] == ts("06:00")
    assert s["lead_h"] == pytest.approx(1 + 55 / 60)
    assert s["false_warnings"] == 0


def test_in_progress_bin_is_never_observed():
    k = kp(h09=6.0)  # runs 09:00-12:00, not complete before 12:00
    ticks, events = replay(omni(), k, ts("10:00"), ts("11:55"), models(lambda t: LOW))
    assert events == []
    assert all(t.observed_kp == 2.0 for t in ticks)
