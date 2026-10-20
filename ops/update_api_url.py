"""After the quick tunnel (re)starts, point Vercel's API_URL at its new URL and redeploy main.

Quick-tunnel URLs change on every restart, so the public site breaks until Vercel learns the new one.
Run by solarbud-api-url.service (see ops/README.md). Standard library only.
"""

import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from collections.abc import Callable
from pathlib import Path

UNIT = "solarbud-tunnel"
MARKER = "Started SolarBud API quick tunnel"
URL_RE = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
SCOPE = "hkk-189s-projects"
PROJECT = "solarbud"
STATE = Path.home() / ".local" / "state" / "solarbud" / "api_url"
# Production builds come from GitHub main, never from a local upload.
DEPLOY = {
    "name": PROJECT,
    "project": PROJECT,
    "target": "production",
    "gitSource": {"type": "github", "repoId": 1404235634, "ref": "main"},
}

Run = Callable[..., subprocess.CompletedProcess]


def latest_url(journal: str, since_marker: str) -> str | None:
    """The newest tunnel URL printed since the unit last started; the whole journal if it never did."""
    lines = journal.splitlines()
    starts = [i for i, line in enumerate(lines) if since_marker in line]
    current = "\n".join(lines[starts[-1] + 1 :] if starts else lines)
    found = URL_RE.findall(current)

    return found[-1] if found else None


def _status(url: str) -> int:
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except OSError:
        return 0


def wait_healthy(
    url: str,
    attempts: int,
    delay_s: float,
    get: Callable[[str], int] = _status,
    sleep: Callable[[float], None] = time.sleep,
) -> bool:
    """True once `<url>/health` answers 200; sleeps between tries, not after the last."""
    for i in range(attempts):
        if get(f"{url}/health") == 200:
            return True
        if i < attempts - 1:
            sleep(delay_s)

    return False


def _api(run: Run, path: str, method: str = "GET", body: dict | None = None, check: bool = True):
    """One `vercel api` call. The body goes through a private temp file so values never appear in argv."""
    cmd = ["vercel", "--scope", SCOPE, "api", path]
    if method != "GET":
        cmd += ["-X", method]
    if body is None:
        return run(cmd, capture_output=True, text=True, check=check)
    with tempfile.NamedTemporaryFile("w", suffix=".json") as f:  # created 0600, deleted on exit
        json.dump(body, f)
        f.flush()
        return run([*cmd, "--input", f.name], capture_output=True, text=True, check=check)


def apply(url: str, state_path: Path, run: Run = subprocess.run) -> bool:
    """Point Vercel at `url` and redeploy. False if it already did for this URL.

    Uses the project API, not `vercel env`, because the CLI's env commands need a linked project in the
    working directory and a systemd service has none. The variable is updated in place (the API's DELETE
    needs an interactive confirmation). The state file is written only after every step worked, so a
    half-done run is simply retried next time.
    """
    if state_path.exists() and state_path.read_text().strip() == url:
        return False

    envs = json.loads(_api(run, f"/v9/projects/{PROJECT}/env").stdout)["envs"]
    existing = [e for e in envs if e["key"] == "API_URL" and "production" in e["target"]]
    if existing:
        _api(run, f"/v9/projects/{PROJECT}/env/{existing[0]['id']}", "PATCH", {"value": url})
    else:
        body = {"key": "API_URL", "value": url, "type": "sensitive", "target": ["production"]}
        _api(run, f"/v10/projects/{PROJECT}/env", "POST", body)
    _api(run, "/v13/deployments?forceNew=1", "POST", DEPLOY)

    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(url + "\n")

    return True


def _read_journal() -> str:
    out = subprocess.run(
        ["journalctl", "--user", "-u", UNIT, "-o", "cat", "--no-pager"],
        capture_output=True,
        text=True,
        check=True,
    )

    return out.stdout


def main(sleep: Callable[[float], None] = time.sleep) -> int:
    url = None
    for _ in range(30):  # the tunnel prints its URL a few seconds after it starts
        url = latest_url(_read_journal(), MARKER)
        if url:
            break
        sleep(2)
    if url is None:
        print("no tunnel URL in the journal yet", file=sys.stderr)
        return 1
    if not wait_healthy(url, 30, 10):
        print(f"{url} never answered /health; Vercel left alone", file=sys.stderr)
        return 1
    print(
        "Vercel updated and redeploying"
        if apply(url, STATE)
        else "Vercel already points at this tunnel"
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
