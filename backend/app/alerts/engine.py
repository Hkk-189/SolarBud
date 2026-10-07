"""Pure alert state machine (AGENTS section 7). No I/O: the caller stores state and sends events.

Decisions (user-approved defaults): ACTIVE is immediate and ignores stale L1 (observed Kp is not
L1); a stale cycle breaks an escalation streak but only holds de-escalation; one event per level
change. WATCH needs Stage 1 and is not produced here.

Anti-flapping (P hovers near p_threshold): three bands per fresh cycle.
  high: p > p_threshold      low: p < p_clear      mid: p_clear <= p <= p_threshold
- Escalation counts only high cycles; any non-high cycle (mid, low, stale) resets `up`.
- De-escalation counts only low cycles. A mid or stale cycle HOLDS `down` (no increment, no reset);
  only a high cycle resets it. So a WARNING is cleared by 3 low cycles, not merely 3 "not high".
- Cooldown: ALL_CLEAR starts `cooldown_cycles` of no-WARNING. While `cooldown > 0` the `up` streak
  is held at 0 (each cycle, fresh or stale, burns one), so a new WARNING needs the cooldown plus
  `up_cycles` fresh high cycles. Observed Kp -> ACTIVE ignores the cooldown (a real storm is never
  suppressed). ACTIVE ending with a high forecast still goes to WARNING (not a re-warn after clear).
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
    p_clear: float = 0.2  # a cycle counts toward de-escalation only below this
    up_cycles: int = 2
    down_cycles: int = 3
    # 6 h at the 5-minute cadence: no new WARNING right after ALL_CLEAR.
    # p_clear and cooldown were picked on the 2022-24 validation block, not on a held-out storm.
    cooldown_cycles: int = 72

    @property
    def kp_threshold(self) -> float:
        return KP_G_THRESHOLDS[self.g_level]


@dataclass(frozen=True)
class AlertState:
    level: Level = Level.NONE
    up: int = 0  # consecutive fresh high cycles
    down: int = 0  # consecutive fresh low cycles (WARNING) / observed-Kp-below cycles (ACTIVE)
    cooldown: int = 0  # cycles left after ALL_CLEAR during which WARNING is blocked


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
    high, low = not stale and p > cfg.p_threshold, not stale and p < cfg.p_clear
    cooling = state.cooldown > 0
    if cooling:
        state = replace(state, cooldown=state.cooldown - 1)
    active_now = observed_kp is not None and observed_kp >= cfg.kp_threshold - KP_TOL

    def to(level: Level) -> tuple[AlertState, list[AlertEvent]]:
        cd = cfg.cooldown_cycles if level == Level.ALL_CLEAR else 0
        return AlertState(level, cooldown=cd), [
            AlertEvent(level, forecast.issued_at, p, observed_kp)
        ]

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
        return state, []  # stale or mid: hold
    up = state.up + 1 if high and not cooling else 0
    if up >= cfg.up_cycles:
        return to(Level.WARNING)
    return replace(state, up=up, down=0), []
