"""Regression: `make migrate` and the container run the alembic console script directly."""

import os
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]


def test_alembic_script_finds_the_app_package_on_its_own():
    exe = Path(sys.executable).with_name("alembic.exe" if os.name == "nt" else "alembic")
    # Nothing listens on port 1, so env.py gets as far as connecting: the import is what is tested.
    env = {**os.environ, "DATABASE_URL": "postgresql+asyncpg://u:p@127.0.0.1:1/x"}
    env.pop("PYTHONPATH", None)
    r = subprocess.run(
        [str(exe), "upgrade", "head"],
        cwd=BACKEND,
        env=env,
        capture_output=True,
        text=True,
        timeout=60,
        check=False,  # it must fail to connect; only the import matters
    )
    assert "ModuleNotFoundError" not in r.stderr, r.stderr[-400:]
