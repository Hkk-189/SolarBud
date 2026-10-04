import numpy as np
import pytest
from ml.evaluate import contingency, coverage, skill


def test_contingency_hand_computed():
    obs = np.array([6, 6, 6, 2, 2, 2, 2, 2.0])
    pred = np.array([6, 6, 2, 6, 2, 2, 2, 2.0])
    c = contingency(obs, pred, 4.667)  # TP2 FN1 FP1 TN4
    assert c["POD"] == pytest.approx(2 / 3) and c["FAR"] == pytest.approx(1 / 3)
    assert c["TSS"] == pytest.approx(2 / 3 - 1 / 5) and c["HSS"] == pytest.approx(14 / 30)


def test_contingency_no_events_is_nan():  # Review Focus 4
    c = contingency(np.zeros(5), np.zeros(5), 4.667)
    assert np.isnan(c["POD"]) and np.isnan(c["FAR"]) and np.isnan(c["TSS"])


def test_coverage():
    assert coverage(np.array([1, 2, 3, 4.0]), np.zeros(4), np.array([1.5, 1.5, 5, 5])) == 0.75


def test_skill():
    assert skill(0.85, 1.0) == pytest.approx(0.15)
