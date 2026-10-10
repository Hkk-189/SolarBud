import type { components } from "./schema";

export type KpForecast = components["schemas"]["KpForecast"];

export type AlertStatus = components["schemas"]["AlertStatus"];

export type SolarWindPoint = components["schemas"]["SolarWindPoint"];

export type KpPoint = components["schemas"]["KpPoint"];

export type ApiResult<T> = { ok: true; data: T } | { ok: false };

const TIMEOUT_MS = 3000;

/** Server-side GET. Any failure (network, timeout, non-2xx, bad JSON) becomes {ok:false}. */
async function get<T>(path: string): Promise<ApiResult<T>> {
  const base = process.env.API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${base}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return { ok: false };

    // SAFETY: the body comes from our own API and T is generated from its OpenAPI spec.
    // Not validated at runtime; a schema drift would surface as wrong data, not {ok:false}.
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false };
  }
}

export const getKpForecast = () => get<KpForecast>("/v1/forecast/kp");

export const getAlertCurrent = () => get<AlertStatus>("/v1/alerts/current");

export const getSolarWindLatest = () => get<SolarWindPoint>("/v1/solar-wind/latest");

function lastHours(hours: number) {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 3600 * 1000);

  return new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
}

/** The last `hours` of 1-minute solar wind, for the history charts. */
export const getSolarWindWindow = (hours: number) =>
  get<SolarWindPoint[]>(`/v1/solar-wind?${lastHours(hours)}`);

/** Observed 3-h Kp for the last `hours`. /v1/kp filters on bin start, so 3 h more catches the straddling bin. */
export const getKpObserved = (hours: number) => get<KpPoint[]>(`/v1/kp?${lastHours(hours + 3)}`);
