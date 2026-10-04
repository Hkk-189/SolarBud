"""Phase 2 alert engine spec (green).

Hand-computed with G1 (kp_threshold = 4.667), p_threshold = 0.5, p_exceed from models/stage2/lgbm.py:
  HIGH q=(5.0, 5.5, 6.0): thr <= p10 -> cdf 0.1 -> P = 0.9  (> 0.5)
  LOW  q=(2.0, 3.0, 4.0): thr >  p90 -> cdf 0.9 -> P = 0.1  (<= 0.5)
"""

from datetime import UTC, datetime, timedelta

from app.alerts.engine import AlertConfig, AlertState, Level, step
from app.schemas.forecast import Horizon, KpForecast

T0 = datetime(2026, 10, 4, 12, 0, tzinfo=UTC)
CFG = AlertConfig()
HIGH, LOW = (5.0, 5.5, 6.0), (2.0, 3.0, 4.0)


def fc(q, i=0, stale=False):
    h = [Horizon(horizon_h=1, p10=q[0], p50=q[1], p90=q[2])]
    return KpForecast(
        issued_at=T0 + timedelta(minutes=30 * i), model_version="t", data_stale=stale, horizons=h
    )


# Probability gap (p_clear = 0.3). thr = 14/3 = 4.6667 throughout:
#   MID  q=(4.0, 4.5, 5.5): q1 < thr <= q2 -> (thr - q1)/(q2 - q1) = 0.1667/1.0
#        -> cdf = 0.5 + 0.4*0.1667 = 0.5667 -> P = 0.4333
#        (above p_clear 0.3, at or below p_threshold 0.5)
#   NEAR q=(4.0, 4.8, 5.5): q0 < thr <= q1 -> (thr - q0)/(q1 - q0) = 0.6667/0.8 = 0.8333
#        -> cdf = 0.1 + 0.4*0.8333 = 0.4333 -> P = 0.5667 (just above p_threshold)
MID, NEAR = (4.0, 4.5, 5.5), (4.0, 4.8, 5.5)


def run(cycles, state=AlertState, cfg=CFG):
    """cycles: list of (quantiles, stale, observed_kp). Returns (state, event levels per cycle)."""
    state = state() if callable(state) else state
    out = []
    for i, (q, stale, obs) in enumerate(cycles):
        state, ev = step(state, fc(q, i, stale), obs, cfg)
        out.append([e.level for e in ev])
    return state, out


def test_kp_threshold_is_g1():
    assert abs(CFG.kp_threshold - 14 / 3) < 1e-9


def test_escalates_on_second_cycle_not_first():
    state, ev = run([(HIGH, False, None)] * 2)
    assert ev == [[], [Level.WARNING]]
    assert state.level == Level.WARNING


def test_single_high_cycle_does_not_escalate_and_streak_resets():
    state, ev = run([(HIGH, False, None), (LOW, False, None), (HIGH, False, None)])
    assert ev == [[], [], []]
    assert state.level == Level.NONE


def test_event_carries_new_level_and_p():
    state, _ = step(AlertState(), fc(HIGH, 0), None, CFG)
    _, ev = step(state, fc(HIGH, 1), None, CFG)
    assert ev[0].level == Level.WARNING and abs(ev[0].p_exceed - 0.9) < 1e-9
    assert ev[0].issued_at == T0 + timedelta(minutes=30)


def test_deescalates_after_three_cycles_not_two():
    state, _ = run([(HIGH, False, None)] * 2)
    state, ev = run([(LOW, False, None)] * 2, state)
    assert ev == [[], []] and state.level == Level.WARNING
    state, ev = run([(LOW, False, None)], state)
    assert ev == [[Level.ALL_CLEAR]] and state.level == Level.ALL_CLEAR


def test_high_cycle_mid_deescalation_resets_countdown():
    state, _ = run([(HIGH, False, None)] * 2)
    cycles = [(LOW, False, None)] * 2 + [(HIGH, False, None)] + [(LOW, False, None)] * 2
    state, ev = run(cycles, state)
    assert ev == [[]] * 5 and state.level == Level.WARNING


def test_stale_never_escalates():
    state, ev = run([(HIGH, True, None)] * 5)
    assert ev == [[]] * 5 and state.level == Level.NONE


def test_stale_cycle_breaks_the_streak():
    state, ev = run([(HIGH, False, None), (HIGH, True, None), (HIGH, False, None)])
    assert ev == [[], [], []] and state.level == Level.NONE


def test_stale_does_not_deescalate_warning():
    state, _ = run([(HIGH, False, None)] * 2)
    state, ev = run([(LOW, True, None)] * 5, state)
    assert ev == [[]] * 5 and state.level == Level.WARNING


def test_interpolated_or_stale_data_alone_never_alerts():
    # gap-filled/interpolated input arrives flagged data_stale=True; even a confident forecast stays silent
    state, ev = run([((8.0, 8.5, 9.0), True, None)] * 4)
    assert ev == [[]] * 4 and state.level == Level.NONE


def test_dedup_one_event_per_level_change():
    _, ev = run([(HIGH, False, None)] * 6)
    assert sum(len(e) for e in ev) == 1


def test_active_when_observed_kp_reaches_threshold_immediately():
    state, ev = run([(LOW, False, 4.667)])
    assert ev == [[Level.ACTIVE]] and state.level == Level.ACTIVE


def test_observed_just_below_threshold_is_not_active():
    state, ev = run([(LOW, False, 4.33)])
    assert ev == [[]] and state.level == Level.NONE


def test_active_not_suppressed_by_stale_l1():
    state, ev = run([(LOW, True, 5.0)])
    assert ev == [[Level.ACTIVE]] and state.level == Level.ACTIVE


def test_active_is_deduped_while_kp_stays_high():
    _, ev = run([(HIGH, False, 5.0)] * 4)
    assert [x for e in ev for x in e] == [Level.ACTIVE]


def test_all_clear_after_storm_ends_in_three_cycles():
    state, _ = run([(HIGH, False, 5.33)])
    assert state.level == Level.ACTIVE
    state, ev = run([(LOW, False, 3.0)] * 2, state)
    assert ev == [[], []] and state.level == Level.ACTIVE
    state, ev = run([(LOW, False, 3.0)], state)
    assert ev == [[Level.ALL_CLEAR]] and state.level == Level.ALL_CLEAR


def test_active_ends_to_warning_if_forecast_still_high():
    state, _ = run([(HIGH, False, 5.33)])
    state, ev = run([(HIGH, False, 3.0)] * 3, state)
    assert ev[-1] == [Level.WARNING] and state.level == Level.WARNING


def test_all_clear_is_emitted_once_and_can_reescalate():
    state, _ = run([(HIGH, False, 5.33)])
    state, ev = run([(LOW, False, 3.0)] * 6, state)
    assert [x for e in ev for x in e] == [Level.ALL_CLEAR]
    # the 12-cycle cooldown must elapse first: ALL_CLEAR came on LOW cycle 3, so 3 of 12 are used
    state, _ = run([(LOW, False, 3.0)] * 9, state)
    _, ev = run([(HIGH, False, 3.0)] * 2, state)
    assert ev == [[], [Level.WARNING]]


def test_mid_band_does_not_deescalate_warning():
    state, _ = run([(HIGH, False, None)] * 2)
    state, ev = run([(MID, False, None)] * 6, state)
    assert ev == [[]] * 6 and state.level == Level.WARNING


def test_mid_band_neither_escalates_nor_counts_up():
    state, ev = run([(NEAR, False, None), (MID, False, None), (NEAR, False, None)])
    assert ev == [[], [], []] and state.level == Level.NONE  # mid breaks the high streak


def test_mid_band_holds_the_deescalation_count():
    # LOW LOW MID LOW: mid neither resets nor advances, so the 3rd low cycle clears
    state, _ = run([(HIGH, False, None)] * 2)
    state, ev = run([(LOW, False, None)] * 2 + [(MID, False, None), (LOW, False, None)], state)
    assert ev == [[], [], [], [Level.ALL_CLEAR]]


def test_runs_around_threshold_do_not_flap():
    # Gannon pattern: p wanders 0.57 (NEAR) <-> 0.43 (MID) in runs. Old rules: WARNING/ALL_CLEAR pairs.
    cycles = ([(NEAR, False, None)] * 2 + [(MID, False, None)] * 3) * 3
    state, ev = run(cycles)
    assert [x for e in ev for x in e] == [Level.WARNING] and state.level == Level.WARNING


def test_alternating_around_threshold_emits_one_warning():
    _, ev = run(
        [(NEAR, False, None), (NEAR, False, None)] + [(MID, False, None), (NEAR, False, None)] * 5
    )
    assert [x for e in ev for x in e] == [Level.WARNING]


COOL = AlertConfig(cooldown_cycles=4)


def _cleared():
    state, _ = run([(HIGH, False, None)] * 2, cfg=COOL)
    state, ev = run([(LOW, False, None)] * 3, state, COOL)
    assert ev[-1] == [Level.ALL_CLEAR]
    return state


def test_cooldown_blocks_rewarning_then_allows_it():
    state, ev = run([(HIGH, False, None)] * 4, _cleared(), COOL)  # 4 blocked cycles
    assert ev == [[]] * 4 and state.level == Level.ALL_CLEAR
    state, ev = run([(HIGH, False, None)] * 2, state, COOL)  # streak starts after cooldown
    assert ev == [[], [Level.WARNING]]


def test_cooldown_counts_stale_cycles_but_never_escalates_on_them():
    _, ev = run([(HIGH, True, None)] * 4 + [(HIGH, False, None)] * 2, _cleared(), COOL)
    assert ev == [[]] * 5 + [[Level.WARNING]]


def test_active_fires_during_cooldown():
    state, ev = run([(LOW, False, 5.0)], _cleared(), COOL)
    assert ev == [[Level.ACTIVE]] and state.level == Level.ACTIVE


def test_cooldown_zero_restores_immediate_rewarning():
    cfg = AlertConfig(cooldown_cycles=0)
    state, _ = run([(HIGH, False, None)] * 2 + [(LOW, False, None)] * 3, cfg=cfg)
    _, ev = run([(HIGH, False, None)] * 2, state, cfg)
    assert ev == [[], [Level.WARNING]]


def test_stale_cycles_still_hold_warning_with_mid_and_low():
    state, _ = run([(HIGH, False, None)] * 2)
    state, ev = run([(MID, True, None), (LOW, True, None)] * 3, state)
    assert ev == [[]] * 6 and state.level == Level.WARNING
