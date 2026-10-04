"""Pure alert state machine (AGENTS section 7). No I/O: the caller stores state and sends events.

Decisions (user-approved defaults): ACTIVE is immediate and ignores stale L1 (observed Kp is not
L1); a stale cycle breaks an escalation streak but only holds de-escalation; one event per level
change. WATCH needs Stage 1 and is not produced here.
"""

from dataclasses import dataclass, replace
from datetime import datetime
from enum import StrEnum

import numpy as np

from app.core.constants import KP_G_THRESHOLDS, KP_TOL
from app.models.stage2.lgbm import p_exceed
from app.schemas.forecast import KpForecast


class Level(StrEnum):
    NONE = "none"
    WATCH = "watch"
    WARNING = "warning"
    ACTIVE = "active"
    ALL_CLEAR = "all_clear"


@dataclass(frozen=True)
class AlertConfig:
    g_level: int = 1
    p_threshold: float = 0.5
    up_cycles: int = 2
    down_cycles: int = 3

    @property
    def kp_threshold(self) -> float:
        return KP_G_THRESHOLDS[self.g_level]


@dataclass(frozen=True)
class AlertState:
    level: Level = Level.NONE
    up: int = 0  # consecutive fresh high cycles
    down: int = 0  # consecutive fresh low cycles (WARNING) / observed-Kp-below cycles (ACTIVE)


@dataclass(frozen=True)
class AlertEvent:
    level: Level  # the new level
    issued_at: datetime
    p_exceed: float
    observed_kp: float | None


DEFAULT_CFG = AlertConfig()


def _p(fc: KpForecast, thr: float) -> float:
    q = np.array([[h.p10, h.p50, h.p90] for h in fc.horizons], float)
    return float(p_exceed(q, thr).max()) if len(q) else 0.0


def step(
    state: AlertState,
    forecast: KpForecast,
    observed_kp: float | None,
    cfg: AlertConfig = DEFAULT_CFG,
) -> tuple[AlertState, list[AlertEvent]]:
    p = _p(forecast, cfg.kp_threshold)
    stale = forecast.data_stale
    high, low = not stale and p > cfg.p_threshold, not stale and p <= cfg.p_threshold
    active_now = observed_kp is not None and observed_kp >= cfg.kp_threshold - KP_TOL

    def to(level: Level) -> tuple[AlertState, list[AlertEvent]]:
        return AlertState(level), [AlertEvent(level, forecast.issued_at, p, observed_kp)]

    if active_now:
        return (
            (replace(state, up=0, down=0), []) if state.level == Level.ACTIVE else to(Level.ACTIVE)
        )
    if state.level == Level.ACTIVE:
        if observed_kp is None:
            return state, []
        down = state.down + 1
        if down >= cfg.down_cycles:
            return to(Level.WARNING if high else Level.ALL_CLEAR)
        return replace(state, down=down), []
    if state.level == Level.WARNING:
        if high:
            return replace(state, down=0), []
        if low:
            down = state.down + 1
            return (
                to(Level.ALL_CLEAR) if down >= cfg.down_cycles else (replace(state, down=down), [])
            )
        return state, []  # stale: hold
    up = state.up + 1 if high else 0
    if up >= cfg.up_cycles:
        return to(Level.WARNING)
    return replace(state, up=up, down=0), []
