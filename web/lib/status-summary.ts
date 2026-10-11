import type { AlertStatus, ApiResult, KpForecast } from "@/lib/api/client";
import { forecastIsOld } from "@/lib/forecast-age";
import { gLevel } from "@/lib/g-level";

const NO_FORECAST = "We can't reach a current forecast, so we can't say whether a storm is coming.";

/** One plain sentence for non-experts. First matching rule wins; unknown alert levels fall through. */
export function statusSummary(
  forecast: ApiResult<KpForecast>,
  alert: ApiResult<AlertStatus>,
  nowMs: number,
): string {
  if (!forecast.ok) return NO_FORECAST;

  const { data_stale: stale, issued_at, horizons } = forecast.data;
  const max = Math.max(...horizons.map((h) => h.p50));

  if (!Number.isFinite(max)) return NO_FORECAST;

  if (forecastIsOld(issued_at, nowMs)) return "The latest forecast is out of date, so treat the numbers below with caution.";

  if (alert.ok && alert.data.level === "active") {
    return stale
      ? "A geomagnetic storm (G1 or stronger) is happening now. Solar wind data is out of date, so the forecast below is less reliable."
      : "A geomagnetic storm (G1 or stronger) is happening now.";
  }

  if (stale) return "The latest forecast used out-of-date solar wind data, so treat the numbers below with caution.";

  if (alert.ok && alert.data.level === "warning") {
    return "A storm warning is in effect: a G1 or stronger storm may arrive within the next 6 hours.";
  }

  const peak = gLevel(max);

  if (peak !== null && peak >= 1) {
    return `Activity is raised: the forecast's likely value reaches G${peak} within the next 6 hours.`;
  }

  return "Quiet: no geomagnetic storm expected in the next 6 hours.";
}
