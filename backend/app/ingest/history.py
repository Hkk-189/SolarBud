"""Bulk-load OMNI HRO (1995-now) and GFZ Kp into data/processed/*.parquet (cached in data/raw)."""

import logging
from datetime import UTC, datetime
from pathlib import Path

import httpx
import pandas as pd

from app.ingest.gfz_kp import parse_gfz_kp
from app.ingest.omni import parse_omni_hro
from app.qc.clean import range_filter

log = logging.getLogger(__name__)
ROOT = Path(__file__).parents[3] / "data"
OMNI_URL = "https://spdf.gsfc.nasa.gov/pub/data/omni/high_res_omni/omni_min{year}.asc"
KP_URL = "https://kp.gfz.de/app/files/Kp_ap_since_1932.txt"


def _download(client: httpx.Client, url: str, path: Path) -> Path | None:
    if path.exists():
        return path
    r = client.get(url, timeout=300)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    path.write_bytes(r.content)
    return path


def main() -> None:
    raw, proc = ROOT / "raw", ROOT / "processed"
    raw.mkdir(parents=True, exist_ok=True)
    proc.mkdir(parents=True, exist_ok=True)
    with httpx.Client(follow_redirects=True) as client:
        kp_path = _download(client, KP_URL, raw / "Kp_ap_since_1932.txt")
        assert kp_path, "GFZ Kp file not found"
        parse_gfz_kp(kp_path.read_text()).to_frame().to_parquet(proc / "kp.parquet")
        parts = []
        for year in range(1995, datetime.now(UTC).year + 1):
            p = _download(client, OMNI_URL.format(year=year), raw / f"omni_min{year}.asc")
            if p is None:
                log.warning("no OMNI file for %s", year)
                continue
            df = range_filter(parse_omni_hro(p.read_text()))
            parts.append(df.resample("5min").mean())
            log.info("loaded OMNI %s", year)
    pd.concat(parts).to_parquet(proc / "omni_5min.parquet")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
