/** Three missed 5-minute worker cycles. The forecast's own `data_stale` only describes L1 data when it was issued. */
export const MAX_FORECAST_AGE_MS = 15 * 60 * 1000;

export function forecastIsOld(issuedAt: string, nowMs: number): boolean {
  return nowMs - Date.parse(issuedAt) > MAX_FORECAST_AGE_MS;
}

/** Wall clock for server components, kept out of render bodies (React purity rule). */
export const nowMs = () => Date.now();
