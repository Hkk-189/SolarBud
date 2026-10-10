from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.v1 import deps
from app.schemas.alerts import AlertStatus

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/current", response_model=AlertStatus)
async def current(get: Annotated[Callable, Depends(deps.current_alert)]):
    return await get() or AlertStatus()  # no state row yet: the worker has not run
