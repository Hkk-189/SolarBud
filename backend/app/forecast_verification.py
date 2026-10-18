"""Match issued forecasts to the Kp that was later observed, for the forecast-vs-reality panel."""

from datetime import UTC, datetime, timedelta

BIN = timedelta(hours=3)


def floor_bin(t: datetime) -> datetime:
    """Start of the 3 h Kp bin containing `t`, in UTC (matches `kp_target` in features/targets.py)."""
    t = t.astimezone(UTC)
    return t.replace(hour=t.hour - t.hour % 3, minute=0, second=0, microsecond=0)


def verify(forecasts: list[dict], kp_bins: list[dict], horizon_h: int) -> list[dict]:
    """One point per target bin: the earliest-issued forecast for it (the longest real lead) and the observed Kp.

    `observed_kp` is None when the bin is missing or its Kp is not available. Sorted by bin start.
    """
    observed = {b["time"]: b["kp"] for b in kp_bins}
    best: dict[datetime, dict] = {}
    for f in forecasts:
        h = next((x for x in f["horizons"] if x["horizon_h"] == horizon_h), None)
        if h is None:
            continue
        bin_start = floor_bin(f["issued_at"] + timedelta(hours=horizon_h))
        if bin_start in best and best[bin_start]["issued_at"] <= f["issued_at"]:
            continue
        best[bin_start] = {
            "bin_start": bin_start,
            "issued_at": f["issued_at"],
            "p10": h["p10"],
            "p50": h["p50"],
            "p90": h["p90"],
            "observed_kp": observed.get(bin_start),
        }
    return [best[k] for k in sorted(best)]
