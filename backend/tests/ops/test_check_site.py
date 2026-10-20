import http.client
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
import yaml
from ops import check_site as c

NOW = datetime(2026, 10, 20, 12, 0, tzinfo=UTC)
WORKFLOW = Path(__file__).resolve().parents[3] / ".github" / "workflows" / "site-check.yml"


def body(minutes_old: float) -> str:
    issued = (NOW - timedelta(minutes=minutes_old)).strftime("%Y-%m-%dT%H:%M:%SZ")

    return json.dumps(
        {"issued_at": issued, "model_version": "x", "data_stale": False, "horizons": []}
    )


def test_a_recent_forecast_is_healthy_and_30_minutes_exactly_is_still_fine():
    assert c.problem(200, body(10), NOW) is None
    assert c.problem(200, body(30), NOW) is None


def test_an_old_forecast_says_how_old():
    assert c.problem(200, body(31), NOW) == "forecast is 31 min old"
    assert c.problem(200, body(190), NOW) == "forecast is 190 min old"


def test_an_unreachable_api_says_the_status():
    assert c.problem(503, '{"error":"unavailable"}', NOW) == "API unreachable (503)"
    assert c.problem(404, "<html>", NOW) == "API unreachable (404)"


@pytest.mark.parametrize(
    "text",
    [
        '{"error": "unavailable"}',
        '{"issued_at": "yesterday"}',
        '{"issued_at": null}',
        "[]",
        "not json",
        "",
        '"x"',
    ],
)
def test_a_200_with_a_wrong_body_is_a_problem_not_a_pass_or_a_crash(text: str):  # Review Focus 4
    assert c.problem(200, text, NOW) == "forecast response has no valid issued_at"


def test_a_forecast_dated_a_little_ahead_is_fine_but_far_ahead_means_a_clock_jumped():
    assert c.problem(200, body(-5), NOW) is None
    assert c.problem(200, body(-30), NOW) == "forecast is dated 30 min in the future (clock jump?)"


def test_main_succeeds_for_a_fresh_forecast_and_fails_loudly_otherwise(
    capsys: pytest.CaptureFixture[str],
):
    now = lambda: NOW

    assert (
        c.main(["check_site.py", "https://x.example"], fetch=lambda url: (200, body(5)), now=now)
        == 0
    )
    assert (
        c.main(["check_site.py", "https://x.example"], fetch=lambda url: (200, body(45)), now=now)
        == 1
    )
    assert "forecast is 45 min old" in capsys.readouterr().err


def test_main_fetches_the_forecast_route_of_the_given_site():
    seen: list[str] = []
    c.main(
        ["check_site.py", "https://x.example/"],
        fetch=lambda url: seen.append(url) or (200, body(1)),
        now=lambda: NOW,
    )

    assert seen == ["https://x.example/api/kp-forecast"]


def test_main_treats_a_network_error_as_a_problem(capsys: pytest.CaptureFixture[str]):
    def down(url: str) -> tuple[int, str]:
        raise OSError("connection refused")

    assert c.main(["check_site.py", "https://x.example"], fetch=down, now=lambda: NOW) == 1
    assert "connection refused" in capsys.readouterr().err


def test_main_treats_a_broken_response_as_a_problem_not_a_traceback(
    capsys: pytest.CaptureFixture[str],
):
    def truncated(url: str) -> tuple[int, str]:
        raise http.client.IncompleteRead(b"par")

    assert c.main(["check_site.py", "https://x.example"], fetch=truncated, now=lambda: NOW) == 1
    assert "IncompleteRead" in capsys.readouterr().err


def test_main_needs_a_site_argument(capsys: pytest.CaptureFixture[str]):
    assert c.main(["check_site.py"], fetch=lambda url: (200, ""), now=lambda: NOW) == 2


def test_the_workflow_runs_every_two_hours_and_on_demand_and_calls_the_checker():
    wf = yaml.safe_load(WORKFLOW.read_text())
    triggers = wf.get("on", wf.get(True))  # YAML 1.1 reads a bare `on` key as True

    assert triggers["schedule"] == [{"cron": "17 */2 * * *"}]
    assert "workflow_dispatch" in triggers
    assert wf["permissions"] == {"contents": "read"}
    steps = next(iter(wf["jobs"].values()))["steps"]
    assert any(
        "ops/check_site.py https://solarbud-hkk-189s-projects.vercel.app" in s.get("run", "")
        for s in steps
    )
