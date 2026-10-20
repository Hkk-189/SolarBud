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


class FakeRun:
    def __init__(self, fail_on: int | None = None, rm_fails: bool = False):
        self.calls: list[tuple[list[str], dict]] = []
        self.fail_on = fail_on
        self.rm_fails = rm_fails

    def __call__(self, cmd: list[str], **kw):
        if "--input" in cmd:  # the request body file is temporary: read it while it still exists
            kw["body"] = Path(cmd[cmd.index("--input") + 1]).read_text()
        self.calls.append((cmd, kw))
        n = len(self.calls)
        if n == self.fail_on:
            raise subprocess.CalledProcessError(1, cmd)
        code = 1 if (self.rm_fails and n == 1) else 0
        return subprocess.CompletedProcess(cmd, code, "", "")


def test_apply_removes_adds_and_redeploys_then_remembers_the_url(tmp_path: Path):
    state = tmp_path / "state" / "api_url"
    run = FakeRun()

    assert u.apply(NEW, state, run=run) is True
    cmds = [c for c, _ in run.calls]
    assert [c[3:6] for c in cmds[:2]] == [["env", "rm", "API_URL"], ["env", "add", "API_URL"]]
    assert cmds[2][3] == "api" and "/v13/deployments" in cmds[2][4]
    assert state.read_text().strip() == NEW


def test_the_new_url_goes_through_stdin_never_argv(
    tmp_path: Path,
):  # secrets stay out of process listings
    run = FakeRun()
    u.apply(NEW, tmp_path / "s", run=run)
    add_cmd, add_kw = run.calls[1]

    assert NEW not in " ".join(add_cmd)
    assert add_kw["input"] == NEW


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


def test_a_failed_add_raises_and_leaves_the_state_alone_so_the_next_run_retries(
    tmp_path: Path,
):  # Review Focus 5
    state = tmp_path / "s"
    state.write_text(OLD)

    with pytest.raises(subprocess.CalledProcessError):
        u.apply(NEW, state, run=FakeRun(fail_on=2))
    assert state.read_text() == OLD


def test_a_failed_remove_is_tolerated_because_the_variable_may_already_be_gone(
    tmp_path: Path,
):  # Review Focus 5
    state = tmp_path / "s"

    assert u.apply(NEW, state, run=FakeRun(rm_fails=True)) is True
    assert state.read_text().strip() == NEW


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
