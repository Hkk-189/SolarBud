"""Record the live API's current state into web/lib/demo-snapshot.ts.

The site shows that recording, clearly labelled, when the API is offline. Run it against a healthy
local stack: `python3 ops/record_demo.py [api-base-url]`. Standard library only.
"""

import json
import sys
import urllib.request
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode

OUT = Path(__file__).parents[1] / "web" / "lib" / "demo-snapshot.ts"
HEADER = (
    "// Recorded by ops/record_demo.py from a live API. Regenerate with `python3 ops/record_demo.py`.\n"
    'import type { DemoSnapshot } from "./demo";\n\n'
    "export const demoSnapshot: DemoSnapshot = "
)


def build(get: Callable[[str], object], now: datetime) -> dict[str, object]:
    def window(hours: int) -> str:
        return urlencode(
            {"start": (now - timedelta(hours=hours)).isoformat(), "end": now.isoformat()}
        )

    kp = get("/v1/forecast/kp")
    wind = get(f"/v1/solar-wind?{window(24)}")
    assert isinstance(kp, dict) and isinstance(wind, list)

    return {
        "recordedAt": kp["issued_at"],
        "kp": kp,
        "alert": get("/v1/alerts/current"),
        "windLatest": get("/v1/solar-wind/latest"),
        # ponytail: every 5th point is enough for a 24 h chart and keeps the file small
        "wind": wind[::5],
        "observed": get(f"/v1/kp?{window(27)}"),  # 24 h plus the 3 h bin that straddles the start
        "verification": get("/v1/forecast/verification?horizon=3&hours=48"),
    }


def render(snapshot: dict[str, object]) -> str:
    return f"{HEADER}{json.dumps(snapshot, indent=2)};\n"


def main(base: str = "http://localhost:8000") -> None:
    def get(path: str) -> object:
        with urllib.request.urlopen(base + path, timeout=20) as res:
            return json.load(res)

    OUT.write_text(render(build(get, datetime.now(UTC))), encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main(*sys.argv[1:2])
