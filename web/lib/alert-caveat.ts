import type { ApiResult, KpForecast } from "@/lib/api/client";
import { forecastIsOld } from "@/lib/forecast-age";

/** Why a quiet alert level cannot be trusted, or null when the forecast is fresh. */
export function alertCaveat(forecast: ApiResult<KpForecast>, nowMs: number): string | null {
  if (!forecast.ok) return "no current forecast, cannot confirm";

  if (forecastIsOld(forecast.data.issued_at, nowMs)) return "forecast over 15 min old, the worker may be down";

  if (forecast.data.data_stale) return "data stale, alerts may be suppressed";

  return null;
}
