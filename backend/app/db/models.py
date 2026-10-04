from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class SolarWind1m(Base):
    """One merged plasma+mag observation per minute; source stored per row (SWPC switches)."""

    __tablename__ = "solar_wind_1m"
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    source: Mapped[str | None] = mapped_column(String(32))
    density_cm3: Mapped[float | None] = mapped_column(Float)
    speed_kms: Mapped[float | None] = mapped_column(Float)
    bx_gsm_nt: Mapped[float | None] = mapped_column(Float)
    by_gsm_nt: Mapped[float | None] = mapped_column(Float)
    bz_gsm_nt: Mapped[float | None] = mapped_column(Float)
    bt_nt: Mapped[float | None] = mapped_column(Float)


class Kp3h(Base):
    __tablename__ = "kp_3h"
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)  # bin start
    kp: Mapped[float | None] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(16), default="swpc")


class Forecast(Base):
    __tablename__ = "forecast"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    model_version: Mapped[str] = mapped_column(String(64))
    data_stale: Mapped[bool]
    horizons: Mapped[list] = mapped_column(JSONB)
