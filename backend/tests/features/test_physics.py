import numpy as np
import pandas as pd
import pytest

from app.features import physics as p


def test_bs():
    out = p.bs(pd.Series([-5.0, 3.0, np.nan, 0.0]))
    assert out.tolist()[:2] == [5.0, 0.0] and np.isnan(out[2]) and out[3] == 0.0


def test_ey_mvm():  # 400 km/s * 5 nT * 1e-3
    assert p.ey_mvm(np.array([400.0]), np.array([-5.0]))[0] == pytest.approx(2.0)


def test_pdyn_npa():  # 1.6726e-6 * 5 * 400^2
    assert p.pdyn_npa(np.array([5.0]), np.array([400.0]))[0] == pytest.approx(1.33808)


def test_bt_transverse_ignores_bx():
    assert p.bt_transverse(np.array([3.0]), np.array([-4.0]))[0] == pytest.approx(5.0)


@pytest.mark.parametrize("by,bz,deg", [(0, -5, 180), (5, 0, 90), (-5, 0, 90), (0, 5, 0)])
def test_clock_angle_is_0_to_180(by, bz, deg):
    assert p.clock_angle_deg(np.array([by * 1.0]), np.array([bz * 1.0]))[0] == pytest.approx(deg)


def test_newell_southward():  # 400^(4/3) * 5^(2/3) * sin^(8/3)(90 deg)
    out = p.newell(np.array([400.0]), np.array([0.0]), np.array([-5.0]))[0]
    assert out == pytest.approx(8617.7388, rel=1e-6)


def test_newell_pure_by():  # theta = 90 -> * sin(45 deg)^(8/3)
    out = p.newell(np.array([400.0]), np.array([5.0]), np.array([0.0]))[0]
    assert out == pytest.approx(3419.9519, rel=1e-6)


def test_newell_northward_is_zero():
    out = p.newell(np.array([400.0]), np.array([0.0]), np.array([5.0]))[0]
    assert out == pytest.approx(0.0, abs=1e-9)


def test_nan_propagates():
    assert np.isnan(p.newell(np.array([np.nan]), np.array([0.0]), np.array([-5.0]))[0])
