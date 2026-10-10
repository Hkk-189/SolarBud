from collections.abc import Callable
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1 import deps
from app.api.v1.solar_wind import MAX_SPAN, _utc
from app.schemas.forecast import KpPoint

router = APIRouter(prefix="/kp", tags=["kp"])


@router.get("", response_model=list[KpPoint])
async def kp_window(
    start: datetime, end: datetime, get: Annotated[Callable, Depends(deps.kp_range)]
):
    start, end = _utc(start), _utc(end)  # naive input is treated as UTC
    if end <= start:
        raise HTTPException(422, "end must be after start")
    if end - start > MAX_SPAN:
        raise HTTPException(422, "range must be at most 7 days")
    return await get(start, end)
