"""Write the OpenAPI spec without a running server: python -m app.export_openapi <out.json>."""

import json
import sys
from pathlib import Path

from app.main import create_app


def spec_json() -> str:
    return json.dumps(create_app().openapi(), indent=2, sort_keys=True) + "\n"


if __name__ == "__main__":
    Path(sys.argv[1]).write_text(spec_json(), encoding="utf-8", newline="\n")
