from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.api.v1 import deps
from app.main import create_app

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

    async def kp(start, end):
        t = datetime(2024, 5, 8, tzinfo=UTC)
        return [{"time": t, "kp": 4.33}, {"time": t + timedelta(hours=3), "kp": None}]

    app.dependency_overrides[deps.kp_range] = lambda: kp
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


def test_kp_contract_and_limits():
    c = client()
    ok = {"start": "2024-05-08T00:00:00Z", "end": "2024-05-09T00:00:00Z"}
    assert c.get("/v1/kp", params=ok).json() == [
        {"time": "2024-05-08T00:00:00Z", "kp": 4.33},
        {"time": "2024-05-08T03:00:00Z", "kp": None},
    ]
    too_long = {"start": "2024-05-01T00:00:00Z", "end": "2024-05-09T00:00:00Z"}
    backwards = {"start": "2024-05-09T00:00:00Z", "end": "2024-05-08T00:00:00Z"}
    naive = {"start": "2024-05-08T00:00:00", "end": "2024-05-09T00:00:00"}
    assert c.get("/v1/kp", params=too_long).status_code == 422
    assert c.get("/v1/kp", params=backwards).status_code == 422
    assert c.get("/v1/kp", params=naive).status_code == 200


def test_health():
    assert client().get("/health").json() == {"status": "ok"}


def _alert_client(status):
    app = create_app()

    async def get():
        return status

    app.dependency_overrides[deps.current_alert] = lambda: get
    return TestClient(app)


def test_alert_current_without_state_is_none():
    r = _alert_client(None).get("/v1/alerts/current")
    assert r.status_code == 200
    assert r.json() == {"level": "none", "since": None, "last_event": None}


def test_alert_current_warning():
    t = datetime(2024, 5, 10, 18, 5, tzinfo=UTC)
    ev = {"issued_at": t, "level": "warning", "p_exceed": 0.9, "observed_kp": 3.0}
    r = _alert_client({"level": "warning", "since": t, "last_event": ev}).get("/v1/alerts/current")
    body = r.json()
    assert body["level"] == "warning" and body["since"] == "2024-05-10T18:05:00Z"
    assert body["last_event"]["issued_at"] == "2024-05-10T18:05:00Z"


def _verification_client():
    app = create_app()
    now = datetime(2024, 5, 10, 22, 0, tzinfo=UTC)
    issued = [
        {
            "issued_at": datetime(2024, 5, 10, 15, 30, tzinfo=UTC),
            "horizons": FC["horizons"],
        },  # bin 18:00, complete
        {
            "issued_at": datetime(2024, 5, 10, 20, 30, tzinfo=UTC),
            "horizons": FC["horizons"],
        },  # bin 21:00, not over yet
    ]

    async def forecasts(start, end):
        return issued

    async def kp(start, end):
        return [{"time": datetime(2024, 5, 10, 18, 0, tzinfo=UTC), "kp": 6.0}]

    app.dependency_overrides[deps.forecast_range] = lambda: forecasts
    app.dependency_overrides[deps.kp_range] = lambda: kp
    app.dependency_overrides[deps.utc_now] = lambda: lambda: now
    return TestClient(app)


def test_verification_contract_lists_only_completed_bins():
    r = _verification_client().get("/v1/forecast/verification").json()
    assert r == [
        {
            "bin_start": "2024-05-10T18:00:00Z",
            "issued_at": "2024-05-10T15:30:00Z",
            "p10": 4.0,
            "p50": 5.0,
            "p90": 6.5,
            "observed_kp": 6.0,
        }
    ]


def test_verification_rejects_a_bad_horizon_or_window():
    c = _verification_client()
    assert c.get("/v1/forecast/verification", params={"horizon": 2}).status_code == 422
    assert c.get("/v1/forecast/verification", params={"hours": 0}).status_code == 422
    assert c.get("/v1/forecast/verification", params={"hours": 169}).status_code == 422
    assert (
        c.get("/v1/forecast/verification", params={"horizon": 6, "hours": 168}).status_code == 200
    )


def test_verification_window_edge_keeps_the_first_bin_and_drops_the_one_before_it():
    app = create_app()
    now = datetime(2024, 5, 10, 22, 0, tzinfo=UTC)  # hours=48 -> first bin starts 2024-05-08 21:00
    issued = [
        {
            "issued_at": datetime(2024, 5, 8, 18, 0, tzinfo=UTC),
            "horizons": FC["horizons"],
        },  # 18:00 + 3 h -> 21:00 bin
        {
            "issued_at": datetime(2024, 5, 8, 17, 55, tzinfo=UTC),
            "horizons": FC["horizons"],
        },  # 17:55 + 3 h -> 18:00 bin
    ]

    async def forecasts(start, end):
        return issued

    async def kp(start, end):
        return []

    app.dependency_overrides[deps.forecast_range] = lambda: forecasts
    app.dependency_overrides[deps.kp_range] = lambda: kp
    app.dependency_overrides[deps.utc_now] = lambda: lambda: now
    r = TestClient(app).get("/v1/forecast/verification").json()
    assert [p["bin_start"] for p in r] == ["2024-05-08T21:00:00Z"]
