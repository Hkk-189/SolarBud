"""Worker process: SWPC ingest every 60 s, Stage 2 forecast every 5 min. Jobs never crash it."""

import asyncio
import logging
from datetime import UTC, datetime, timedelta
from pathlib import Path

import httpx
import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.core.constants import HORIZONS_H
from app.db.models import Forecast, Kp3h, SolarWind1m
from app.db.session import SessionLocal
from app.features.propagation import shift_to_bowshock
from app.features.targets import kp_last
from app.features.windows import trailing_features
from app.ingest.swpc import MAG_COLUMNS, PLASMA_COLUMNS, fetch_json, parse_rtsw, parse_swpc_kp
from app.models import registry
from app.qc.clean import is_stale, range_filter

log = logging.getLogger(__name__)
SW_COLS = ["density_cm3", "speed_kms", "bx_gsm_nt", "by_gsm_nt", "bz_gsm_nt", "bt_nt"]


def run_forecast_cycle(sw_1m: pd.DataFrame, kp3h: pd.Series, now: datetime, models: dict) -> dict:
    """Pure forecast step (no I/O). Stale L1 data is flagged, never silently used as fresh.

    ponytail: features use only data that has already reached the bow shock by `now`; the
    in-flight L1 data (15-90 min) is dropped. Using it adds lead time but needs training on
    that horizon semantics.
    """
    last = sw_1m.index.max().to_pydatetime() if len(sw_1m) else None
    df5 = range_filter(shift_to_bowshock(sw_1m)).resample("5min").mean()
    t = pd.DatetimeIndex([pd.Timestamp(now).floor("5min")])
    X = trailing_features(df5).reindex(t).assign(kp_last=kp_last(t, kp3h).to_numpy())
    horizons = []
    for h in HORIZONS_H:
        cols = getattr(models[h], "columns", None) or list(X.columns)  # train/serve parity
        p10, p50, p90 = (float(v) for v in models[h].predict(X.reindex(columns=cols))[0])
        horizons.append({"horizon_h": h, "p10": p10, "p50": p50, "p90": p90})
    return {"issued_at": now, "model_version": models[1].version,
            "data_stale": is_stale(last, now), "horizons": horizons}


async def ingest_once(client: httpx.AsyncClient) -> None:
    wind, mag, kp = await asyncio.gather(
        fetch_json(client, settings.swpc_plasma_url),
        fetch_json(client, settings.swpc_mag_url),
        fetch_json(client, settings.swpc_kp_url),
    )
    async with SessionLocal() as s:
        if wind is not None and mag is not None:
            pw, pm = parse_rtsw(wind, PLASMA_COLUMNS), parse_rtsw(mag, MAG_COLUMNS)
            df = pw.drop(columns="source").join(pm.drop(columns="source"), how="outer")
            df["source"] = pw["source"].reindex(df.index).fillna(pm["source"].reindex(df.index))
            rows = [{"time": t.to_pydatetime(), "source": r.source,
                     **{c: (None if pd.isna(r[c]) else float(r[c])) for c in SW_COLS}}
                    for t, r in df.iterrows()]
            if rows:
                stmt = insert(SolarWind1m).values(rows)
                await s.execute(stmt.on_conflict_do_update(
                    index_elements=["time"],
                    set_={c: getattr(stmt.excluded, c) for c in [*SW_COLS, "source"]}))
        else:
            log.warning("solar wind fetch failed; data will go stale")
        if kp:
            ks = parse_swpc_kp(kp).dropna()
            rows = [{"time": t.to_pydatetime(), "kp": float(v), "source": "swpc"}
                    for t, v in ks.items()]
            if rows:
                stmt = insert(Kp3h).values(rows)
                await s.execute(stmt.on_conflict_do_update(
                    index_elements=["time"], set_={"kp": stmt.excluded.kp}))
        await s.commit()


async def forecast_once(models: dict) -> None:
    now = datetime.now(UTC)
    async with SessionLocal() as s:
        sw = (await s.execute(select(SolarWind1m).where(
            SolarWind1m.time >= now - timedelta(hours=8)).order_by(SolarWind1m.time))).scalars()
        sw_df = pd.DataFrame([{"time": r.time, **{c: getattr(r, c) for c in SW_COLS}} for r in sw])
        sw_df = (sw_df.set_index("time") if len(sw_df)
                 else pd.DataFrame(columns=SW_COLS, index=pd.DatetimeIndex([], tz="UTC")))
        kp = (await s.execute(select(Kp3h).where(
            Kp3h.time >= now - timedelta(days=2)))).scalars()
        kp3h = pd.Series({r.time: r.kp for r in kp}, dtype=float)
        kp3h.index = pd.DatetimeIndex(kp3h.index, tz="UTC") if len(kp3h) else kp3h.index
        out = run_forecast_cycle(sw_df, kp3h, now, models)
        s.add(Forecast(**out))
        await s.commit()
    log.info("forecast issued", extra={"stale": out["data_stale"]})


def _safe(coro_fn, name: str):
    async def job():
        try:
            await coro_fn()
        except Exception:
            log.exception("job %s failed", name)
    return job


async def main() -> None:
    models = {h: registry.load(Path(settings.model_dir) / f"stage2_h{h}.joblib")[0]
              for h in HORIZONS_H}
    async with httpx.AsyncClient() as client:
        sched = AsyncIOScheduler(timezone="UTC")
        sched.add_job(_safe(lambda: ingest_once(client), "ingest"), "interval", seconds=60)
        sched.add_job(_safe(lambda: forecast_once(models), "forecast"), "interval", minutes=5)
        sched.start()
        await asyncio.Event().wait()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
