from fastapi import APIRouter, FastAPI

from app.api.v1 import forecast, solar_wind


def create_app() -> FastAPI:
    app = FastAPI(title="SolarWatch API", version="0.1.0")
    v1 = APIRouter(prefix="/v1")
    v1.include_router(forecast.router)
    v1.include_router(solar_wind.router)
    app.include_router(v1)

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok"}

    return app
