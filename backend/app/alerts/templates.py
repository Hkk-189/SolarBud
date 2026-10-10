"""Persona message templates. Pure: event in, text out. Local time + UTC in every message."""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pandas as pd

from app.alerts.engine import AlertConfig, AlertEvent, Level
from app.core.constants import HORIZONS_H

SWPC_URL = "https://www.swpc.noaa.gov"
FOOTER = f"Not an official forecast. See {SWPC_URL}"


def drivers(frame: pd.DataFrame, at: datetime) -> list[str]:
    """Latest valid Bz and speed at or before `at` (OMNI 5-min or live 1-min frame)."""
    ok = frame.loc[: pd.Timestamp(at), ["bz_gsm_nt", "speed_kms"]].dropna()
    if ok.empty:
        return []
    row = ok.iloc[-1]
    return [f"Bz {row.bz_gsm_nt:.0f} nT", f"solar wind {row.speed_kms:.0f} km/s"]


def _confidence(p: float) -> str:
    return "high" if p >= 0.8 else "medium" if p >= 0.6 else "low"


def _window(ev: AlertEvent, tz: str) -> str:
    a, b = ev.issued_at, ev.issued_at + timedelta(hours=max(HORIZONS_H))
    la, lb = a.astimezone(ZoneInfo(tz)), b.astimezone(ZoneInfo(tz))
    return f"{la:%H:%M}-{lb:%H:%M} {la.tzname()} ({a:%H:%M}-{b:%H:%M} UTC)"


def _at(ev: AlertEvent, tz: str) -> str:
    la = ev.issued_at.astimezone(ZoneInfo(tz))
    return f"{la:%H:%M} {la.tzname()} ({ev.issued_at:%H:%M} UTC)"


def _kp(ev: AlertEvent) -> str:
    return f"Kp {ev.observed_kp:.1f}" if ev.observed_kp is not None else "Kp unknown"


def render(ev: AlertEvent, persona: str, tz: str, drivers: list[str], cfg: AlertConfig) -> str:
    if persona not in ("aurora", "gnss"):
        raise ValueError(f"unknown persona: {persona}")
    if ev.level not in (Level.WARNING, Level.ACTIVE, Level.ALL_CLEAR):
        raise ValueError(f"unsupported level: {ev.level}")
    g, aurora = f"G{cfg.g_level}", persona == "aurora"
    drv = ", ".join(drivers)
    if ev.level == Level.ALL_CLEAR:
        tail = "Aurora chances back to low." if aurora else "GNSS risk back to Low."
        head = f"✅ Storm conditions have ended ({_kp(ev)}) as of {_at(ev, tz)}. {tail}"
        return f"{head}\n{FOOTER}"
    win = _window(ev, tz)
    if ev.level == Level.WARNING:
        head = (
            f"🌌 Aurora Warning: {g} storm likely, {win}."
            if aurora
            else f"🛰️ GNSS Risk: elevated ({g} storm likely), {win}."
        )
        body = f"Confidence: {_confidence(ev.p_exceed)} ({ev.p_exceed:.0%}). Drivers: {drv}."
    else:
        head = (
            f"🌌 Aurora Active: {g} storm under way ({_kp(ev)}), {win}."
            if aurora
            else f"🛰️ GNSS Risk: HIGH now ({g} storm under way, {_kp(ev)}), {win}."
        )
        body = f"Drivers: {drv}."
    advice = (
        []
        if aurora
        else ["RTK/GPS accuracy may be degraded. Consider rescheduling precision work."]
    )
    return "\n".join([head, *advice, body, FOOTER])
