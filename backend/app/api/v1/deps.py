"""Data access as overridable dependencies: each returns an async callable (tests override)."""

from datetime import datetime

from sqlalchemy import select

from app.db.models import Forecast, SolarWind1m
from app.db.session import SessionLocal

_SW = ("time", "source", "density_cm3", "speed_kms", "bx_gsm_nt", "by_gsm_nt", "bz_gsm_nt", "bt_nt")


def latest_forecast():
    async def get() -> dict | None:
        async with SessionLocal() as s:
            row = (
                await s.execute(select(Forecast).order_by(Forecast.issued_at.desc()).limit(1))
            ).scalar_one_or_none()
        if row is None:
            return None
        return {
            "issued_at": row.issued_at,
            "model_version": row.model_version,
            "data_stale": row.data_stale,
            "horizons": row.horizons,
        }

    return get


def solar_wind_range():
    async def get(start: datetime, end: datetime) -> list[dict]:
        async with SessionLocal() as s:
            rows = (
                await s.execute(
                    select(SolarWind1m)
                    .where(SolarWind1m.time >= start, SolarWind1m.time <= end)
                    .order_by(SolarWind1m.time)
                )
            ).scalars()
            return [{c: getattr(r, c) for c in _SW} for r in rows]

    return get
