import pytest

from app.core.constants import kp_to_g


@pytest.mark.parametrize(
    "kp,g",
    [
        (0, 0),
        (4.333, 0),
        (4.667, 1),
        (5.0, 1),
        (5.333, 1),
        (5.667, 2),
        (6.667, 3),
        (7.667, 4),
        (8.667, 5),
        (9.0, 5),
    ],
)
def test_kp_to_g(kp, g):
    assert kp_to_g(kp) == g


def test_kp_to_g_tolerates_gfz_rounding():
    assert kp_to_g(4.66667) == 1 and kp_to_g(4.666) == 1


def test_swpc_defaults_use_live_rtsw_feeds():  # legacy products/solar-wind/*.json now 404
    from app.core.config import Settings

    s = Settings(_env_file=None)
    assert "json/rtsw/rtsw_wind_1m.json" in s.swpc_plasma_url
    assert "json/rtsw/rtsw_mag_1m.json" in s.swpc_mag_url
