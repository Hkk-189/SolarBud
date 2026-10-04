from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1 import deps
from app.schemas.forecast import SolarWindPoint

router = APIRouter(prefix="/solar-wind", tags=["solar-wind"])
MAX_SPAN = timedelta(days=7)


def _utc(d: datetime) -> datetime:
    return d.replace(tzinfo=UTC) if d.tzinfo is None else d.astimezone(UTC)


@router.get("/latest", response_model=SolarWindPoint)
async def latest(get: Annotated[Callable, Depends(deps.solar_wind_range)]):
    now = datetime.now(UTC)
    rows = await get(now - timedelta(minutes=15), now)
    if not rows:
        raise HTTPException(503, "no recent solar wind data")
    return rows[-1]


@router.get("", response_model=list[SolarWindPoint])
async def window(
    start: datetime, end: datetime, get: Annotated[Callable, Depends(deps.solar_wind_range)]
):
    start, end = _utc(start), _utc(end)  # naive input is treated as UTC
    if end <= start:
        raise HTTPException(422, "end must be after start")
    if end - start > MAX_SPAN:
        raise HTTPException(422, "range must be at most 7 days")
    return await get(start, end)
