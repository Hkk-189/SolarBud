from datetime import UTC, datetime

from app.forecast_verification import verify


def t(h: int, m: int = 0) -> datetime:
    return datetime(2024, 5, 10, h, m, tzinfo=UTC)


def fc(issued: datetime, p50: float = 4.0, horizons: tuple[int, ...] = (1, 3, 6)) -> dict:
    return {
        "issued_at": issued,
        "horizons": [
            {"horizon_h": h, "p10": p50 - 1, "p50": p50, "p90": p50 + 1} for h in horizons
        ],
    }


def test_target_is_the_3h_bin_containing_issue_time_plus_horizon():
    assert verify([fc(t(7, 30))], [], 3)[0]["bin_start"] == t(9)  # 07:30 + 3 h = 10:30
    assert verify([fc(t(7, 30))], [], 1)[0]["bin_start"] == t(6)  # 07:30 + 1 h = 08:30
    assert verify([fc(t(7, 30))], [], 6)[0]["bin_start"] == t(12)  # 07:30 + 6 h = 13:30


def test_keeps_the_earliest_forecast_for_each_bin():
    pts = verify([fc(t(8, 50), 6.0), fc(t(7, 10), 4.0)], [], 3)  # both target the 09:00 bin

    assert len(pts) == 1
    assert (pts[0]["issued_at"], pts[0]["p50"]) == (t(7, 10), 4.0)


def test_joins_observed_kp_and_leaves_a_missing_or_null_one_as_none():
    kp = [{"time": t(9), "kp": 5.0}, {"time": t(12), "kp": None}]
    pts = verify([fc(t(7, 30)), fc(t(10, 30)), fc(t(13, 30))], kp, 3)  # bins 09:00, 12:00, 15:00

    assert [p["observed_kp"] for p in pts] == [5.0, None, None]


def test_skips_a_forecast_without_that_horizon_and_sorts_by_bin():
    pts = verify([fc(t(13, 30)), fc(t(7, 30)), fc(t(1, 0), horizons=(1, 3))], [], 6)

    assert [p["bin_start"] for p in pts] == [t(12), t(18)]


def test_nothing_in_nothing_out():
    assert verify([], [{"time": t(9), "kp": 5.0}], 3) == []
