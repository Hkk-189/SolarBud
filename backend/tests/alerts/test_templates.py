from datetime import UTC, datetime

import pytest

from app.alerts.engine import AlertConfig, AlertEvent, Level
from app.alerts.templates import render

T0 = datetime(2026, 10, 4, 12, 0, tzinfo=UTC)
CFG = AlertConfig()
DRIVERS = ["Bz -18 nT", "speed 720 km/s"]
SWPC = "https://www.swpc.noaa.gov"


def ev(level, p=0.9, obs=None):
    return AlertEvent(level, T0, p, obs)


def msg(level, persona, tz="Asia/Kolkata", **kw):
    return render(ev(level, **kw), persona, tz, DRIVERS, CFG)


def test_aurora_warning_snapshot():
    assert msg(Level.WARNING, "aurora") == (
        "🌌 Aurora Warning: G1 storm likely, 17:30-23:30 IST (12:00-18:00 UTC).\n"
        "Confidence: high (90%). Drivers: Bz -18 nT, speed 720 km/s.\n"
        "Not an official forecast. See https://www.swpc.noaa.gov"
    )


def test_gnss_active_snapshot():
    assert msg(Level.ACTIVE, "gnss", obs=5.0) == (
        "🛰️ GNSS Risk: HIGH now (G1 storm under way, Kp 5.0), "
        "17:30-23:30 IST (12:00-18:00 UTC).\n"
        "RTK/GPS accuracy may be degraded. Consider rescheduling precision work.\n"
        "Drivers: Bz -18 nT, speed 720 km/s.\n"
        "Not an official forecast. See https://www.swpc.noaa.gov"
    )


@pytest.mark.parametrize("persona", ["aurora", "gnss"])
@pytest.mark.parametrize("level", [Level.WARNING, Level.ACTIVE, Level.ALL_CLEAR])
def test_every_message_has_local_utc_link_and_disclaimer(persona, level):
    m = msg(level, persona, obs=3.0)
    assert "IST" in m and "UTC" in m and SWPC in m and "Not an official forecast" in m


def test_all_clear_snapshot():
    assert msg(Level.ALL_CLEAR, "gnss", obs=3.0) == (
        "✅ Storm conditions have ended (Kp 3.0) as of 17:30 IST (12:00 UTC). GNSS risk back to Low.\n"
        "Not an official forecast. See https://www.swpc.noaa.gov"
    )


def test_local_time_follows_the_subscriber_timezone():
    assert "08:00-14:00 EDT (12:00-18:00 UTC)" in msg(Level.WARNING, "aurora", "America/New_York")


@pytest.mark.parametrize(("p", "word"), [(0.9, "high"), (0.6, "medium"), (0.52, "low")])
def test_confidence_words(p, word):
    assert f"Confidence: {word} " in msg(Level.WARNING, "aurora", p=p)


def test_unknown_persona_raises():
    with pytest.raises(ValueError, match="persona"):
        msg(Level.WARNING, "pilot")


def test_watch_is_not_renderable_yet():  # needs Stage 1
    with pytest.raises(ValueError, match="level"):
        msg(Level.WATCH, "aurora")


def test_drivers_skip_a_nan_last_row():
    import pandas as pd

    from app.alerts.templates import drivers

    idx = pd.date_range("2024-05-10 17:58", periods=3, freq="1min", tz="UTC")
    frame = pd.DataFrame({"bz_gsm_nt": [-12.0, -9.6, None], "speed_kms": [700, 710.4, None]}, idx)
    assert drivers(frame, idx[-1].to_pydatetime()) == ["Bz -10 nT", "solar wind 710 km/s"]
    assert drivers(frame.iloc[:0], idx[-1].to_pydatetime()) == []
