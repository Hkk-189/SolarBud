import pandas as pd
from ml.splits import split_masks

CFG = {
    "val_start": "2022-01-01", "test_start": "2025-01-01", "buffer_days": 7,
    "storms": [{"id": "2024-05-gannon", "start": "2024-05-10", "end": "2024-05-12"}],
}


def test_split_masks():
    idx = pd.DatetimeIndex(
        ["2021-06-01", "2022-06-01", "2024-05-02 23:00", "2024-05-03 01:00", "2024-05-11",
         "2025-03-01"],
        tz="UTC",
    )
    m = split_masks(idx, CFG)
    assert m["train"].tolist() == [True, False, False, False, False, False]
    assert m["val"].tolist() == [False, True, True, False, False, False]  # buffer from 05-03
    assert m["test"].tolist() == [False, False, False, False, True, True]
    assert not (m["train"] & m["test"]).any() and not (m["val"] & m["test"]).any()
