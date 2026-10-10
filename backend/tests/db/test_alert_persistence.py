"""Needs Postgres (`docker compose up -d postgres`). Runs in a throwaway database."""

import asyncio
import os
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.models import AlertEventRow, AlertStateRow

pytestmark = pytest.mark.db
BACKEND = Path(__file__).resolve().parents[2]
ADMIN = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/solarbud_test"


def _migrate() -> None:
    exe = Path(sys.executable).with_name("alembic")
    subprocess.run(
        [str(exe), "upgrade", "head"],
        cwd=BACKEND,
        env={**os.environ, "DATABASE_URL": URL},
        check=True,
    )


async def test_migration_and_state_round_trip():
    admin = create_async_engine(ADMIN, isolation_level="AUTOCOMMIT")
    async with admin.connect() as c:
        await c.execute(text("DROP DATABASE IF EXISTS solarbud_test"))
        await c.execute(text("CREATE DATABASE solarbud_test"))
    await asyncio.to_thread(_migrate)
    eng = create_async_engine(URL)
    t = datetime(2024, 5, 10, 18, 5, tzinfo=UTC)
    async with async_sessionmaker(eng)() as s:
        s.add_all(
            [
                AlertStateRow(id=1, level="warning", up=0, down=1, cooldown=0, since=t),
                AlertEventRow(issued_at=t, level="warning", p_exceed=0.9, observed_kp=None),
            ]
        )
        await s.commit()
    async with async_sessionmaker(eng)() as s:
        row = await s.get(AlertStateRow, 1)
        assert row and (row.level, row.down, row.since) == ("warning", 1, t)
    await eng.dispose()
    async with admin.connect() as c:
        await c.execute(text("DROP DATABASE solarbud_test"))
    await admin.dispose()
