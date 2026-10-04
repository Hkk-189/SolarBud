import json
from pathlib import Path

from app.export_openapi import spec_json

COMMITTED = Path(__file__).resolve().parents[3] / "web" / "lib" / "api" / "openapi.json"


def test_spec_has_web_routes():
    paths = json.loads(spec_json())["paths"]
    assert "/v1/forecast/kp" in paths
    assert "/v1/solar-wind/latest" in paths


def test_committed_spec_is_up_to_date():
    assert COMMITTED.read_text(encoding="utf-8") == spec_json(), "run `make openapi`"
