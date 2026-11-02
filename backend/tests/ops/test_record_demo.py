import json

from ops import record_demo as r

NOW = r.datetime(2026, 11, 2, 5, 20, tzinfo=r.UTC)
WIND = [{"time": f"t{i}"} for i in range(12)]


def fake_get(path: str):
    if path.startswith("/v1/solar-wind?"):
        return WIND

    return {
        "/v1/forecast/kp": {"issued_at": "2026-11-02T05:14:59Z"},
        "/v1/alerts/current": {"level": "none"},
        "/v1/solar-wind/latest": {"time": "t11"},
    }.get(path, [])


def test_the_recording_is_stamped_with_the_forecast_time_and_thins_the_wind_to_every_fifth_point():
    snap = r.build(fake_get, NOW)

    assert snap["recordedAt"] == "2026-11-02T05:14:59Z"
    assert snap["wind"] == [WIND[0], WIND[5], WIND[10]]
    assert snap["windLatest"] == {"time": "t11"}


def test_the_history_windows_end_now_and_cover_the_hours_the_site_asks_for():
    paths: list[str] = []
    r.build(lambda p: paths.append(p) or fake_get(p), NOW)

    assert any(
        "start=2026-11-01T05%3A20%3A00%2B00%3A00&end=2026-11-02T05%3A20%3A00%2B00%3A00" in p
        for p in paths
    )
    assert any(
        "start=2026-11-01T02%3A20%3A00%2B00%3A00" in p for p in paths
    )  # Kp: 24 h plus the straddling 3 h bin


def test_the_file_is_a_typed_typescript_constant_holding_the_json():
    text = r.render({"recordedAt": "x"})

    assert text.startswith("// Recorded by ops/record_demo.py")
    body = text.split("export const demoSnapshot: DemoSnapshot = ", 1)[1].removesuffix(";\n")
    assert json.loads(body) == {"recordedAt": "x"}
