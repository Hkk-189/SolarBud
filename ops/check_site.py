"""Fail when the public site cannot show a fresh forecast. Run by .github/workflows/site-check.yml.

Usage: python3 ops/check_site.py https://site.example
Exit 0 = healthy, 1 = a problem (printed to stderr, so the workflow run goes red and GitHub emails the owner),
2 = bad usage. Standard library only.
"""

import json
import sys
import urllib.error
import urllib.request
from collections.abc import Callable, Sequence
from datetime import UTC, datetime, timedelta

# The worker forecasts every 5 min and the web calls 15 min stale; 30 min avoids flapping on one missed cycle.
MAX_AGE = timedelta(minutes=30)


def problem(status: int, body: str, now: datetime, max_age: timedelta = MAX_AGE) -> str | None:
    """What is wrong with the forecast response, or None if it is fine."""
    if status != 200:
        return f"API unreachable ({status})"
    try:
        issued = datetime.fromisoformat(json.loads(body)["issued_at"])
    except (ValueError, KeyError, TypeError):
        return "forecast response has no valid issued_at"
    if issued.tzinfo is None:
        issued = issued.replace(tzinfo=UTC)
    age = now - issued
    if age > max_age:
        return f"forecast is {int(age.total_seconds() // 60)} min old"

    return None


def _fetch(url: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")


def main(
    argv: Sequence[str],
    fetch: Callable[[str], tuple[int, str]] = _fetch,
    now: Callable[[], datetime] = lambda: datetime.now(UTC),
) -> int:
    if len(argv) != 2:
        print("usage: check_site.py https://site.example", file=sys.stderr)
        return 2
    try:
        status, body = fetch(f"{argv[1].rstrip('/')}/api/kp-forecast")
    except OSError as e:
        print(f"site unreachable: {e}", file=sys.stderr)
        return 1
    found = problem(status, body, now())
    if found:
        print(found, file=sys.stderr)
        return 1
    print("ok: the public forecast is fresh")

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
