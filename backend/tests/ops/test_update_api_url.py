import json
import subprocess
from pathlib import Path

import pytest
from ops import update_api_url as u

MARKER = u.MARKER
OLD = "https://old-url-from-before.trycloudflare.com"
NEW = "https://leather-vitamin-seats-scout.trycloudflare.com"


def journal(*lines: str) -> str:
    return "\n".join(lines)


def test_latest_url_uses_only_the_current_run():  # Review Focus 1
    j = journal(
        MARKER,
        f"INF |  {OLD}  |",
        f"{MARKER} (URL changes on restart).",
        "INF Requesting new quick Tunnel",
        f"INF |  {NEW}  |",
    )

    assert u.latest_url(j, MARKER) == NEW


def test_a_run_that_has_not_printed_its_url_yet_gives_none_not_the_old_one():  # Review Focus 1
    j = journal(
        f"INF |  {OLD}  |", f"{MARKER} (URL changes on restart).", "INF Requesting new quick Tunnel"
    )

    assert u.latest_url(j, MARKER) is None


def test_without_any_marker_the_last_url_in_the_journal_is_used():
    assert u.latest_url(journal(f"|  {OLD}  |", f"|  {NEW}  |"), MARKER) == NEW
    assert u.latest_url("nothing here", MARKER) is None


def test_wait_healthy_returns_true_once_health_answers_200_and_false_if_it_never_does():  # Review Focus 2
    answers = iter([0, 530, 200])
    sleeps: list[float] = []

    assert u.wait_healthy(NEW, 5, 7.0, get=lambda url: next(answers), sleep=sleeps.append) is True
    assert sleeps == [7.0, 7.0]
    assert u.wait_healthy(NEW, 3, 1.0, get=lambda url: 503, sleep=lambda s: None) is False


ENVS = {
    "envs": [
        {"id": "keep1", "key": "OTHER", "target": ["production"]},
        {"id": "old1", "key": "API_URL", "target": ["production"]},
        {"id": "prev1", "key": "API_URL", "target": ["preview"]},
    ]
}


class FakeRun:
    """Records `vercel api` calls; answers the env listing; can fail one call or all deletes."""

    def __init__(self, fail_when: str | None = None, envs: dict | None = None):
        self.calls: list[tuple[list[str], dict]] = []
        self.fail_when = fail_when
        self.envs = ENVS if envs is None else envs

    @staticmethod
    def route(cmd: list[str]) -> str:
        method = cmd[cmd.index("-X") + 1] if "-X" in cmd else "GET"

        return f"{method} {cmd[cmd.index('api') + 1]}"

    def __call__(self, cmd: list[str], **kw):
        if "--input" in cmd:  # the request body file is temporary: read it while it still exists
            kw["body"] = Path(cmd[cmd.index("--input") + 1]).read_text()
        self.calls.append((cmd, kw))
        route = self.route(cmd)
        if self.fail_when and self.fail_when in route:
            raise subprocess.CalledProcessError(1, cmd)
        out = json.dumps(self.envs) if route == "GET /v9/projects/solarbud/env" else "{}"

        return subprocess.CompletedProcess(cmd, 0, out, "")

    @property
    def routes(self) -> list[str]:
        return [self.route(c) for c, _ in self.calls]


def test_apply_updates_the_production_api_url_in_place_then_redeploys_and_remembers(tmp_path: Path):
    state = tmp_path / "state" / "api_url"
    run = FakeRun()

    assert u.apply(NEW, state, run=run) is True
    assert run.routes == [
        "GET /v9/projects/solarbud/env",
        "PATCH /v9/projects/solarbud/env/old1",  # never the preview variable or another key
        "POST /v13/deployments?forceNew=1",
    ]
    assert state.read_text().strip() == NEW


def test_apply_creates_the_variable_as_sensitive_production_when_there_is_none(tmp_path: Path):
    run = FakeRun(envs={"envs": [{"id": "keep1", "key": "OTHER", "target": ["production"]}]})
    u.apply(NEW, tmp_path / "s", run=run)

    assert run.routes[1] == "POST /v10/projects/solarbud/env"
    assert json.loads(run.calls[1][1]["body"]) == {
        "key": "API_URL",
        "value": NEW,
        "type": "sensitive",
        "target": ["production"],
    }


def test_the_new_url_travels_in_a_private_body_file_never_in_argv(tmp_path: Path):
    run = FakeRun()
    u.apply(NEW, tmp_path / "s", run=run)
    cmd, kw = run.calls[1]

    assert NEW not in " ".join(cmd)  # process listings must not show it
    assert json.loads(kw["body"]) == {"value": NEW}


def test_the_deploy_request_builds_main_from_github_for_production(tmp_path: Path):
    run = FakeRun()
    u.apply(NEW, tmp_path / "s", run=run)
    body = json.loads(run.calls[2][1]["body"])

    assert body["target"] == "production"
    assert body["gitSource"] == {"type": "github", "repoId": 1404235634, "ref": "main"}


def test_same_url_as_last_time_does_nothing(tmp_path: Path):  # Review Focus 3
    state = tmp_path / "s"
    state.write_text(NEW + "\n")
    run = FakeRun()

    assert u.apply(NEW, state, run=run) is False
    assert run.calls == []


@pytest.mark.parametrize("failing", ["PATCH /v9", "POST /v13"])
def test_a_failed_step_raises_and_leaves_the_state_alone_so_the_next_run_retries(  # Review Focus 5
    tmp_path: Path, failing: str
):
    state = tmp_path / "s"
    state.write_text(OLD)

    with pytest.raises(subprocess.CalledProcessError):
        u.apply(NEW, state, run=FakeRun(fail_when=failing))
    assert state.read_text() == OLD


def _patch_main(monkeypatch: pytest.MonkeyPatch, journal_text: str, healthy: bool):
    applied: list[str] = []
    monkeypatch.setattr(u, "_read_journal", lambda: journal_text)
    monkeypatch.setattr(u, "wait_healthy", lambda url, attempts, delay_s: healthy)
    monkeypatch.setattr(u, "apply", lambda url, state: applied.append(url) or True)

    return applied


def test_main_leaves_vercel_alone_when_the_api_never_answers(
    monkeypatch: pytest.MonkeyPatch,
):  # Review Focus 2
    applied = _patch_main(monkeypatch, f"{MARKER}\n|  {NEW}  |", healthy=False)

    assert u.main(sleep=lambda s: None) == 1
    assert applied == []


def test_main_applies_a_healthy_url_and_succeeds(monkeypatch: pytest.MonkeyPatch):
    applied = _patch_main(monkeypatch, f"{MARKER}\n|  {NEW}  |", healthy=True)

    assert u.main(sleep=lambda s: None) == 0
    assert applied == [NEW]


def test_main_fails_when_no_url_ever_appears(monkeypatch: pytest.MonkeyPatch):
    applied = _patch_main(monkeypatch, f"{OLD}\n{MARKER}", healthy=True)

    assert u.main(sleep=lambda s: None) == 1
    assert applied == []
