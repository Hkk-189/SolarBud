from datetime import UTC, datetime

from pydantic import AwareDatetime, BaseModel, field_serializer


def iso_utc(v: datetime) -> str:
    return v.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


class Horizon(BaseModel):
    horizon_h: int
    p10: float
    p50: float
    p90: float


class KpForecast(BaseModel):
    issued_at: AwareDatetime
    model_version: str
    data_stale: bool
    horizons: list[Horizon]

    @field_serializer("issued_at")
    def _ser(self, v: datetime) -> str:
        return iso_utc(v)


class SolarWindPoint(BaseModel):
    time: AwareDatetime
    source: str | None = None
    density_cm3: float | None = None
    speed_kms: float | None = None
    bx_gsm_nt: float | None = None
    by_gsm_nt: float | None = None
    bz_gsm_nt: float | None = None
    bt_nt: float | None = None

    @field_serializer("time")
    def _ser(self, v: datetime) -> str:
        return iso_utc(v)


class KpPoint(BaseModel):
    time: AwareDatetime  # 3-h bin start
    kp: float | None = None

    @field_serializer("time")
    def _ser(self, v: datetime) -> str:
        return iso_utc(v)


class VerificationPoint(BaseModel):
    bin_start: AwareDatetime
    issued_at: AwareDatetime
    p10: float
    p50: float
    p90: float
    observed_kp: float | None = None

    @field_serializer("bin_start", "issued_at")
    def _ser(self, v: datetime) -> str:
        return iso_utc(v)
