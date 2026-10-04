from pathlib import Path

import joblib

REQUIRED_META = ("config", "data_range", "git_sha", "metrics")


def save(obj, meta: dict, path: str | Path) -> None:
    missing = [k for k in REQUIRED_META if k not in meta]
    assert not missing, f"model metadata missing {missing}"
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": obj, "meta": meta}, path)


def load(path: str | Path):
    d = joblib.load(path)
    return d["model"], d["meta"]
