from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1 import deps
from app.schemas.forecast import KpForecast

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.get("/kp", response_model=KpForecast)
async def kp_forecast(get: Annotated[Callable, Depends(deps.latest_forecast)]):
    fc = await get()
    if fc is None:
        raise HTTPException(503, "no forecast issued yet")
    return fc
