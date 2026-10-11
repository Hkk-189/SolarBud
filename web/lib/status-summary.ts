import type { AlertStatus, ApiResult, KpForecast } from "@/lib/api/client";
import { forecastIsOld } from "@/lib/forecast-age";
import { gLevel } from "@/lib/g-level";

/** One plain sentence for non-experts. First matching rule wins; unknown alert levels fall through. */
export function statusSummary(
  forecast: ApiResult<KpForecast>,
  alert: ApiResult<AlertStatus>,
  nowMs: number,
): string {
  if (!forecast.ok) return "We can't reach a current forecast, so we can't say whether a storm is coming.";

  if (forecast.data.data_stale || forecastIsOld(forecast.data.issued_at, nowMs)) {
    return "The latest forecast is out of date, so treat the numbers below with caution.";
  }

  if (alert.ok && alert.data.level === "active") return "A geomagnetic storm (G1 or stronger) is happening now.";

  if (alert.ok && alert.data.level === "warning") {
    return "A geomagnetic storm (G1 or stronger) is likely within the next 6 hours.";
  }

  const peak = gLevel(Math.max(...forecast.data.horizons.map((h) => h.p50)));

  if (peak !== null && peak >= 1) {
    return `Activity is raised: the forecast touches G${peak}, but not confidently enough for a warning.`;
  }

  return "Quiet: no geomagnetic storm expected in the next 6 hours.";
}
