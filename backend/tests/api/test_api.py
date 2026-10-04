from datetime import UTC, datetime

from app.api.v1 import deps
from app.main import create_app
from fastapi.testclient import TestClient

FC = {
    "issued_at": datetime(2024, 5, 10, 18, 0, tzinfo=UTC),
    "model_version": "stage2-lgbm-0.1.0",
    "data_stale": False,
    "horizons": [{"horizon_h": h, "p10": 4.0, "p50": 5.0, "p90": 6.5} for h in (1, 3, 6)],
}


def client():
    app = create_app()

    async def fc():
        return FC

    async def sw(start, end):
        return []

    app.dependency_overrides[deps.latest_forecast] = lambda: fc
    app.dependency_overrides[deps.solar_wind_range] = lambda: sw
    return TestClient(app)


def test_forecast_contract():
    r = client().get("/v1/forecast/kp").json()
    assert r["issued_at"].endswith("Z") and r["model_version"] and r["data_stale"] is False
    assert [h["horizon_h"] for h in r["horizons"]] == [1, 3, 6]
    assert all(h["p10"] <= h["p50"] <= h["p90"] for h in r["horizons"])


def test_solar_wind_range_limits():  # Review Focus 5
    c = client()
    too_long = {"start": "2024-05-01T00:00:00Z", "end": "2024-05-09T00:00:00Z"}
    backwards = {"start": "2024-05-09T00:00:00Z", "end": "2024-05-08T00:00:00Z"}
    naive = {"start": "2024-05-08T00:00:00", "end": "2024-05-09T00:00:00"}
    assert c.get("/v1/solar-wind", params=too_long).status_code == 422
    assert c.get("/v1/solar-wind", params=backwards).status_code == 422
    assert c.get("/v1/solar-wind", params=naive).status_code == 200


def test_health():
    assert client().get("/health").json() == {"status": "ok"}
