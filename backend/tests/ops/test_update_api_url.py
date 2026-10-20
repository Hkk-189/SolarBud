import json
import subprocess
from pathlib import Path

import pytest
from ops import update_api_url as u

OLD = "https://old-url-from-before.trycloudflare.com"
NEW = "https://leather-vitamin-seats-scout.trycloudflare.com"
API_HOST_LINE = (
    'failed to request quick Tunnel: Post "https://api.trycloudflare.com/tunnel": dial tcp: lookup'
)


def test_latest_url_is_the_last_one_printed():  # Review Focus 1: the text is one invocation's output
    assert u.latest_url(f"INF |  {OLD}  |\nINF |  {NEW}  |") == NEW


def test_no_url_yet_gives_none():
    assert u.latest_url("INF Requesting new quick Tunnel on trycloudflare.com...") is None
    assert u.latest_url("") is None


def test_cloudflares_own_api_host_in_a_boot_time_error_is_never_taken_for_the_tunnel():
    assert u.latest_url(API_HOST_LINE) is None
    assert u.latest_url(f"{API_HOST_LINE}\nINF |  {NEW}  |\n{API_HOST_LINE}") == NEW


class FakeSystemctl:
    def __init__(self, invocation_id: str):
        self.calls: list[list[str]] = []
        self.invocation_id = invocation_id

    def __call__(self, cmd: list[str], **kw):
        self.calls.append(cmd)
        out = self.invocation_id + "\n" if cmd[0] == "systemctl" else f"INF |  {NEW}  |\n"

        return subprocess.CompletedProcess(cmd, 0, out, "")


def test_the_journal_is_read_for_the_tunnels_current_invocation_only():  # Review Focus 1
    run = FakeSystemctl("abc123")

    assert NEW in u._read_journal(run=run)
    assert run.calls[0] == [
        "systemctl",
        "--user",
        "show",
        "-p",
        "InvocationID",
        "--value",
        "solarbud-tunnel",
    ]
    assert "_SYSTEMD_INVOCATION_ID=abc123" in run.calls[1]


def test_no_running_invocation_means_nothing_to_read():
    run = FakeSystemctl("")

    assert u._read_journal(run=run) == ""
    assert len(run.calls) == 1


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
    """Records `vercel api` calls; answers the env listing; can fail one call."""

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
    applied = _patch_main(monkeypatch, f"|  {NEW}  |", healthy=False)

    assert u.main(sleep=lambda s: None) == 1
    assert applied == []


def test_main_applies_a_healthy_url_and_succeeds(monkeypatch: pytest.MonkeyPatch):
    applied = _patch_main(monkeypatch, f"|  {NEW}  |", healthy=True)

    assert u.main(sleep=lambda s: None) == 0
    assert applied == [NEW]


def test_main_fails_when_no_url_ever_appears(monkeypatch: pytest.MonkeyPatch):
    applied = _patch_main(monkeypatch, API_HOST_LINE, healthy=True)

    assert u.main(sleep=lambda s: None) == 1
    assert applied == []


def test_main_reports_vercels_error_text_and_fails_when_a_call_breaks(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
):
    def broken(url: str, state: Path):
        raise subprocess.CalledProcessError(
            1, ["vercel"], output="out-must-not-be-printed", stderr="Error: rate limited"
        )

    monkeypatch.setattr(u, "_read_journal", lambda: f"|  {NEW}  |")
    monkeypatch.setattr(u, "wait_healthy", lambda url, attempts, delay_s: True)
    monkeypatch.setattr(u, "apply", broken)

    assert u.main(sleep=lambda s: None) == 1
    err = capsys.readouterr().err
    assert "rate limited" in err
    assert "out-must-not-be-printed" not in err
