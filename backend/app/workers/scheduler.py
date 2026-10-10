"""Worker process: SWPC ingest every 60 s, Stage 2 forecast every 5 min. Jobs never crash it."""

import asyncio
import logging
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import cast

import httpx
import numpy as np
import pandas as pd
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.alerts.engine import DEFAULT_CFG, AlertConfig, AlertEvent, AlertState, Level, step
from app.alerts.templates import drivers, render
from app.core.config import settings
from app.core.constants import HORIZONS_H
from app.db.models import AlertEventRow, AlertStateRow, Forecast, Kp3h, SolarWind1m
from app.db.session import SessionLocal
from app.features.propagation import shift_to_bowshock
from app.features.targets import kp_last
from app.features.windows import trailing_features
from app.ingest.swpc import MAG_COLUMNS, PLASMA_COLUMNS, fetch_json, parse_rtsw, parse_swpc_kp
from app.models import registry
from app.qc.clean import is_stale, range_filter
from app.schemas.forecast import KpForecast

log = logging.getLogger(__name__)
SW_COLS = ["density_cm3", "speed_kms", "bx_gsm_nt", "by_gsm_nt", "bz_gsm_nt", "bt_nt"]


def _dt(t: object) -> datetime:
    return cast(pd.Timestamp, t).to_pydatetime()


def run_forecast_cycle(sw_1m: pd.DataFrame, kp3h: pd.Series, now: datetime, models: dict) -> dict:
    """Pure forecast step (no I/O). Stale L1 data is flagged, never silently used as fresh.

    ponytail: features use only data that has already reached the bow shock by `now`; the
    in-flight L1 data (15-90 min) is dropped. Using it adds lead time but needs training on
    that horizon semantics.
    """
    last = pd.Timestamp(sw_1m.index.max()).to_pydatetime() if len(sw_1m) else None
    df5 = range_filter(shift_to_bowshock(sw_1m)).resample("5min").mean()
    return forecast_from_5min(df5, kp3h, now, last, models)


def forecast_from_5min(
    df5: pd.DataFrame, kp3h: pd.Series, now: datetime, last: datetime | None, models: dict
) -> dict:
    """Features + predict on a 5-min frame already at the bow shock (also used by ml/backtest.py,
    where OMNI is pre-shifted: never shift twice)."""
    t = pd.DatetimeIndex([pd.Timestamp(now).floor("5min")])
    X = trailing_features(df5).reindex(t).assign(kp_last=kp_last(t, kp3h).to_numpy())
    horizons = []
    for h in HORIZONS_H:
        cols = getattr(models[h], "columns", None) or list(X.columns)  # train/serve parity
        p10, p50, p90 = (float(v) for v in models[h].predict(X.reindex(columns=cols))[0])
        horizons.append({"horizon_h": h, "p10": p10, "p50": p50, "p90": p90})
    return {
        "issued_at": now,
        "model_version": models[1].version,
        "data_stale": is_stale(last, now),
        "horizons": horizons,
    }


def alert_cycle(
    state: AlertState,
    out: dict,
    observed_kp: float | None,
    sw: pd.DataFrame,
    cfg: AlertConfig = DEFAULT_CFG,
) -> tuple[AlertState, list[AlertEvent], list[str]]:
    """Pure alert step on one forecast cycle; renders both personas for each event (dry run)."""
    state, events = step(state, KpForecast(**out), observed_kp, cfg)
    msgs = [
        render(e, persona, "UTC", drivers(sw, e.issued_at), cfg)
        for e in events
        for persona in ("aurora", "gnss")
    ]
    return state, events, msgs


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
            rows = [
                {
                    "time": _dt(t),
                    "source": r.source,
                    **{c: (None if pd.isna(r[c]) else float(r[c])) for c in SW_COLS},
                }
                for t, r in df.iterrows()
            ]
            if rows:
                stmt = insert(SolarWind1m).values(rows)
                await s.execute(
                    stmt.on_conflict_do_update(
                        index_elements=["time"],
                        set_={c: getattr(stmt.excluded, c) for c in [*SW_COLS, "source"]},
                    )
                )
        else:
            log.warning("solar wind fetch failed; data will go stale")
        if kp:
            ks = parse_swpc_kp(kp).dropna()
            rows = [{"time": _dt(t), "kp": float(v), "source": "swpc"} for t, v in ks.items()]
            if rows:
                stmt = insert(Kp3h).values(rows)
                await s.execute(
                    stmt.on_conflict_do_update(
                        index_elements=["time"], set_={"kp": stmt.excluded.kp}
                    )
                )
        await s.commit()


async def forecast_once(models: dict) -> None:
    now = datetime.now(UTC)
    async with SessionLocal() as s:
        sw = (
            await s.execute(
                select(SolarWind1m)
                .where(SolarWind1m.time >= now - timedelta(hours=8))
                .order_by(SolarWind1m.time)
            )
        ).scalars()
        sw_df = pd.DataFrame([{"time": r.time, **{c: getattr(r, c) for c in SW_COLS}} for r in sw])
        sw_df = (
            sw_df.set_index("time")
            if len(sw_df)
            else pd.DataFrame(columns=SW_COLS, index=pd.DatetimeIndex([], tz="UTC"))
        )
        kp = (await s.execute(select(Kp3h).where(Kp3h.time >= now - timedelta(days=2)))).scalars()
        kp3h = pd.Series({r.time: r.kp for r in kp}, dtype=float)
        kp3h.index = pd.DatetimeIndex(kp3h.index, tz="UTC") if len(kp3h) else kp3h.index
        out = run_forecast_cycle(sw_df, kp3h, now, models)
        obs = kp_last(pd.DatetimeIndex([pd.Timestamp(now).floor("5min")]), kp3h).iloc[0]
        row = await s.get(AlertStateRow, 1) or AlertStateRow(id=1, level=Level.NONE, since=None)
        prev = AlertState(Level(row.level), row.up or 0, row.down or 0, row.cooldown or 0)
        state, events, msgs = alert_cycle(prev, out, None if np.isnan(obs) else float(obs), sw_df)
        row.level, row.up, row.down, row.cooldown = (
            state.level,
            state.up,
            state.down,
            state.cooldown,
        )
        if events:
            row.since = events[-1].issued_at
        s.add_all([Forecast(**out), row, *(AlertEventRow(**vars(e)) for e in events)])
        await s.commit()  # forecast, state and events together: a failed cycle advances nothing
    log.info("forecast issued", extra={"stale": out["data_stale"], "alert": str(state.level)})
    for m in msgs:
        log.info("DRY RUN alert (not sent):\n%s", m)


def _safe(coro_fn, name: str):
    async def job():
        try:
            await coro_fn()
        except Exception:
            log.exception("job %s failed", name)

    return job


async def main() -> None:
    models = {
        h: registry.load(Path(settings.model_dir) / f"stage2_h{h}.joblib")[0] for h in HORIZONS_H
    }
    async with httpx.AsyncClient() as client:
        sched = AsyncIOScheduler(timezone="UTC")
        sched.add_job(_safe(lambda: ingest_once(client), "ingest"), "interval", seconds=60)
        sched.add_job(_safe(lambda: forecast_once(models), "forecast"), "interval", minutes=5)
        sched.start()
        await asyncio.Event().wait()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
