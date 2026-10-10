import pandas as pd

from app.alerts.engine import AlertState, Level
from app.workers.scheduler import alert_cycle, run_forecast_cycle
from tests.workers.test_forecast_cycle import Fake, _sw

NOW = pd.Timestamp("2024-05-10 18:00", tz="UTC")
KP = pd.Series([3.0], index=[pd.Timestamp("2024-05-10 12:00", tz="UTC")])
MODELS = {h: Fake() for h in (1, 3, 6)}  # p50 5.0 >= G1: P(>=5) is high


def _cycles(n, sw_end=NOW, obs=None):
    state, events, msgs = AlertState(), [], []
    for i in range(n):
        now = (NOW + pd.Timedelta(minutes=5 * i)).to_pydatetime()
        sw = _sw(sw_end + pd.Timedelta(minutes=5 * i))
        out = run_forecast_cycle(sw, KP, now, MODELS)
        state, ev, m = alert_cycle(state, out, obs, sw)
        events += ev
        msgs += m
    return state, events, msgs


def test_two_fresh_high_cycles_warn_with_rendered_messages():
    state, events, msgs = _cycles(2)
    assert state.level == Level.WARNING
    assert [e.level for e in events] == [Level.WARNING]
    assert len(msgs) == 2  # aurora + gnss
    assert all("Bz -10 nT" in m and "500 km/s" in m for m in msgs)


def test_observed_kp_goes_active():
    state, events, _ = _cycles(1, obs=5.33)
    assert state.level == Level.ACTIVE and events[0].level == Level.ACTIVE


def test_stale_forecast_never_escalates():
    state, events, msgs = _cycles(3, sw_end=NOW - pd.Timedelta(minutes=30))
    assert state.level == Level.NONE and events == [] and msgs == []
