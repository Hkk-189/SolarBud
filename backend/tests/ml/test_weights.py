import pandas as pd
from ml.train_stage2 import _weights

Y = pd.Series([2.0, 4.667, 6.667, 8.0])


def test_no_config_is_unweighted():
    assert _weights(Y, {}).tolist() == [1, 1, 1, 1]


def test_kp5_and_kp7_weights_stack():  # Kp>=5- gets 3; Kp>=7- gets 3 + (5-1) = 7
    assert _weights(Y, {"kp5": 3, "kp7": 5}).tolist() == [1, 3, 7, 7]
