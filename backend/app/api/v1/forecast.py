from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.v1 import deps
from app.forecast_verification import BIN, floor_bin, verify
from app.schemas.forecast import KpForecast, VerificationPoint

router = APIRouter(prefix="/forecast", tags=["forecast"])
HORIZONS = (1, 3, 6)


@router.get("/kp", response_model=KpForecast)
async def kp_forecast(get: Annotated[Callable, Depends(deps.latest_forecast)]):
    fc = await get()
    if fc is None:
        raise HTTPException(503, "no forecast issued yet")
    return fc


@router.get("/verification", response_model=list[VerificationPoint])
async def verification(
    forecasts: Annotated[Callable, Depends(deps.forecast_range)],
    kp: Annotated[Callable, Depends(deps.kp_range)],
    now: Annotated[Callable[[], datetime], Depends(deps.utc_now)],
    horizon: int = 3,
    hours: Annotated[int, Query(ge=1, le=168)] = 48,
):
    """How past forecasts compare with the Kp observed afterwards, over completed 3 h bins only."""
    if horizon not in HORIZONS:
        raise HTTPException(422, f"horizon must be one of {HORIZONS}")
    t = now()
    last = floor_bin(t)  # bins starting before this are complete
    first = floor_bin(t - timedelta(hours=hours))
    issued = await forecasts(first - timedelta(hours=horizon), t)
    bins = await kp(first - BIN, last)
    return [p for p in verify(issued, bins, horizon) if first <= p["bin_start"] < last]
