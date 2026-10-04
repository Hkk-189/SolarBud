import numpy as np
import pandas as pd
import pytest

from app.models import registry
from app.models.stage2.baselines import NewellKp, persistence
from app.models.stage2.lgbm import QuantileKp


def test_persistence():
    assert persistence(np.array([2.0, 5.333])).tolist() == [2.0, 5.333]


def test_newell_kp_recovers_line():
    x = np.linspace(0, 10000, 50)
    m = NewellKp().fit(x, 1 + 0.001 * x)
    assert np.allclose(m.predict(np.array([0.0, 5000.0])), [1.0, 6.0], atol=1e-9)


def _xy(n=600, seed=0):
    r = np.random.default_rng(seed)
    X = pd.DataFrame({"a": r.normal(size=n), "b": r.normal(size=n)})
    return X, 3 + 2 * X.a + r.normal(0, 0.5, n)


def test_quantile_shape_order_determinism():
    X, y = _xy()
    p1 = QuantileKp(seed=0).fit(X, y).predict(X)
    p2 = QuantileKp(seed=0).fit(X, y).predict(X)
    assert p1.shape == (len(X), 3) and (np.diff(p1, axis=1) >= 0).all()
    np.testing.assert_array_equal(p1, p2)


def test_registry_round_trip(tmp_path):
    X, y = _xy()
    m = QuantileKp(seed=0).fit(X, y)
    meta = {
        "config": {},
        "data_range": ["1995-01-01", "2021-12-31"],
        "git_sha": "abc",
        "metrics": {},
    }
    registry.save(m, meta, tmp_path / "m.joblib")
    m2, meta2 = registry.load(tmp_path / "m.joblib")
    np.testing.assert_array_equal(m.predict(X), m2.predict(X))
    assert meta2 == meta


def test_p_exceed_hand_computed():
    from app.models.stage2.lgbm import p_exceed

    q = np.array([[2.0, 4.0, 6.0]] * 5 + [[3.0, 3.0, 3.0]])
    thr = np.array([1.0, 3.0, 5.0, 6.0, 9.0])
    got = [p_exceed(q[i : i + 1], t)[0] for i, t in enumerate(thr)]
    assert np.allclose(got, [0.9, 0.7, 0.3, 0.1, 0.1])  # CDF 0.1, 0.3, 0.7, 0.9, 0.9
    assert p_exceed(q[5:], 3.0)[0] == pytest.approx(0.9)  # tied quantiles, no NaN
    assert p_exceed(q[5:], 3.1)[0] == pytest.approx(0.1)
