"""Scoring spec for alert-parameter tuning. Synthetic ticks and Kp; hand-computed.

G1 threshold is 4.667 (Kp 5-). kp_last(t) sees the 3 h bin starting at floor(t, 3h) - 3h, so a storm
bin starting 12:00 is first observed at 15:00. A WARNING is useful when it holds at some tick in
[onset - 3 h, onset]; lead is onset minus the start of the unbroken WARNING/ACTIVE run holding then.
"""

import pandas as pd
import pytest
from ml.alert_tuning import Score, model_key, pick, score, storm_onsets, val_segments
from ml.backtest import Tick

from app.alerts.engine import AlertConfig, AlertEvent, Level

CFG = AlertConfig()
D = "2022-03-10"


def ts(hhmm: str, day: str = D) -> pd.Timestamp:
    return pd.Timestamp(f"{day} {hhmm}", tz="UTC")


def kp(days: int = 1, **bins: float) -> pd.Series:
    s = pd.Series(2.0, index=pd.date_range(ts("00:00"), periods=8 * days, freq="3h"))
    for k, v in bins.items():
        s[ts(f"{k[1:]}:00")] = v
    return s


def ticks(held: dict[str, str], p=lambda t: 0.0, stale=lambda t: False) -> list[Tick]:
    """One day of 5-min ticks. held maps 'HH:MM' start -> 'HH:MM' end (exclusive) of a WARNING run."""
    out = []
    for t in pd.date_range(ts("00:00"), ts("23:55"), freq="5min"):
        warn = any(ts(a) <= t < ts(b) for a, b in held.items())
        out.append(
            Tick(t.to_pydatetime(), p(t), None, stale(t), Level.WARNING if warn else Level.NONE)
        )
    return out


def ev(level: Level, hhmm: str) -> AlertEvent:
    return AlertEvent(level, ts(hhmm).to_pydatetime(), 0.9, None)


def test_storm_onsets_merge_bins_within_a_day():
    k = kp(days=3, h12=6.0, h15=5.0, h21=5.0)  # one episode (gaps < 24 h)
    k[pd.Timestamp("2022-03-12 06:00", tz="UTC")] = 6.0  # next episode, > 24 h later
    assert storm_onsets(k, CFG.kp_threshold) == [ts("12:00"), ts("06:00", "2022-03-12")]


def test_warned_storm_has_lead_and_no_miss():
    k = kp(h12=6.0)
    t = ticks({"09:30": "13:00"})
    s = score(t, [ev(Level.WARNING, "09:30")], k, CFG)
    assert (s.storms, s.missed, s.false_warnings) == (1, 0, 0)
    assert s.leads == (pytest.approx(2.5),)


def test_unwarned_storm_is_missed_and_warning_after_onset_does_not_count():
    k = kp(h12=6.0)
    t = ticks({"12:30": "14:00"})  # WARNING only after the onset bin started
    s = score(t, [ev(Level.WARNING, "12:30")], k, CFG)
    assert (s.storms, s.missed) == (1, 1)
    assert s.leads == ()


def test_warning_with_no_storm_is_false():
    s = score(ticks({"02:00": "03:00"}), [ev(Level.WARNING, "02:00")], kp(), CFG)
    assert (s.storms, s.missed, s.false_warnings) == (0, 0, 1)


def test_scores_add_across_segments():
    a = score(ticks({"02:00": "03:00"}), [ev(Level.WARNING, "02:00")], kp(), CFG)
    b = score(ticks({}), [], kp(), CFG)
    total = a + b
    assert total.false_warnings == 1
    assert total.hours == pytest.approx(a.hours + b.hours)
    assert total.per_month("false_warnings") == pytest.approx(1 / (total.hours / 730.5))


def test_pick_fewest_false_warnings_without_more_misses_than_baseline():
    base = AlertConfig(cooldown_cycles=12)
    cfgs = [AlertConfig(cooldown_cycles=c) for c in (12, 24, 36, 72)]
    h = 730.5  # one month, so per-month rates equal the counts
    results = {
        cfgs[0]: Score(h, 10, 1, 8, 20),  # baseline
        cfgs[1]: Score(h, 10, 1, 5, 18),
        cfgs[2]: Score(h, 10, 1, 5, 15),  # ties on false warnings, fewer events: wins
        cfgs[3]: Score(h, 10, 3, 1, 10),  # fewest false warnings but misses more storms
    }
    assert pick(results, base) == cfgs[2]


def test_pick_keeps_baseline_when_nothing_beats_it():
    base = AlertConfig()
    other = AlertConfig(cooldown_cycles=24)
    results = {base: Score(730.5, 10, 1, 4, 12), other: Score(730.5, 10, 1, 6, 12)}
    assert pick(results, base) == base


def test_val_segments_split_at_holdout_buffers():
    cfg = {
        "buffer_days": 2,
        "val_start": "2022-01-01",
        "test_start": "2022-02-01",
        "storms": [{"id": "s", "start": "2022-01-15", "end": "2022-01-16"}],
    }
    idx = pd.date_range("2021-12-20", "2022-02-10", freq="5min", tz="UTC")
    segs = val_segments(idx, cfg)
    assert segs == [
        (pd.Timestamp("2022-01-01 00:00", tz="UTC"), pd.Timestamp("2022-01-12 23:55", tz="UTC")),
        (pd.Timestamp("2022-01-19 00:00", tz="UTC"), pd.Timestamp("2022-01-31 23:55", tz="UTC")),
    ]


def test_model_key_changes_when_any_artefact_changes(tmp_path):
    for h in (1, 3, 6):
        (tmp_path / f"stage2_h{h}.joblib").write_bytes(b"model %d" % h)
    k1 = model_key(tmp_path)
    assert model_key(tmp_path) == k1 and len(k1) == 12
    (tmp_path / "stage2_h3.joblib").write_bytes(b"retrained")
    assert model_key(tmp_path) != k1


def test_warning_inside_the_onset_bin_is_a_late_miss():
    s = score(ticks({"12:30": "14:00"}), [ev(Level.WARNING, "12:30")], kp(h12=6.0), CFG)
    assert (s.missed, s.miss_kinds) == (1, ("late",))


def test_probability_that_rose_without_a_warning_is_a_rose_miss():
    p = lambda t: 0.45 if ts("10:00") <= t < ts("11:00") else 0.0
    s = score(ticks({}, p=p), [], kp(h12=6.0), CFG)
    assert s.miss_kinds == ("rose",)


def test_low_probability_throughout_is_a_flat_miss():
    s = score(ticks({}, p=lambda t: 0.1), [], kp(h12=6.0), CFG)
    assert s.miss_kinds == ("flat",)


def test_mostly_stale_data_before_onset_is_a_stale_miss():
    stale = lambda t: ts("09:00") <= t <= ts("12:00")
    s = score(ticks({}, p=lambda t: 0.9, stale=stale), [], kp(h12=6.0), CFG)
    assert s.miss_kinds == ("stale",)


def test_miss_kinds_add_across_segments():
    assert (Score(miss_kinds=("late",)) + Score(miss_kinds=("flat",))).miss_kinds == (
        "late",
        "flat",
    )
