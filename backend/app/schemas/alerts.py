from datetime import datetime

from pydantic import AwareDatetime, BaseModel, field_serializer

from app.schemas.forecast import iso_utc


class AlertEventOut(BaseModel):
    issued_at: AwareDatetime
    level: str
    p_exceed: float
    observed_kp: float | None = None

    @field_serializer("issued_at")
    def _ser(self, v: datetime) -> str:
        return iso_utc(v)


class AlertStatus(BaseModel):
    level: str = "none"
    since: AwareDatetime | None = None
    last_event: AlertEventOut | None = None

    @field_serializer("since")
    def _ser(self, v: datetime | None) -> str | None:
        return None if v is None else iso_utc(v)
