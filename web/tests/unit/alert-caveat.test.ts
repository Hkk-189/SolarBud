import { describe, expect, it } from "vitest";
import { alertCaveat } from "@/lib/alert-caveat";
import type { KpForecast } from "@/lib/api/client";

const forecast: KpForecast = {
  issued_at: "2026-10-04T12:00:00Z",
  model_version: "lgbm-1",
  data_stale: false,
  horizons: [{ horizon_h: 1, p10: 4.0, p50: 6.0, p90: 7.33 }],
};

const NOW = Date.parse("2026-10-04T12:05:00Z");

describe("alertCaveat", () => {
  it("says so when there is no forecast", () => {
    expect(alertCaveat({ ok: false }, NOW)).toBe("no current forecast, cannot confirm");
  });
  it("flags a forecast over 15 minutes old", () => {
    expect(alertCaveat({ ok: true, data: forecast }, Date.parse("2026-10-04T12:20:01Z"))).toBe(
      "forecast over 15 min old, the worker may be down",
    );
  });
  it("is null at exactly 15 minutes", () => {
    expect(alertCaveat({ ok: true, data: forecast }, Date.parse("2026-10-04T12:15:00Z"))).toBeNull();
  });
  it("flags stale data", () => {
    expect(alertCaveat({ ok: true, data: { ...forecast, data_stale: true } }, NOW)).toBe(
      "data stale, alerts may be suppressed",
    );
  });
  it("is null for a fresh forecast", () => {
    expect(alertCaveat({ ok: true, data: forecast }, NOW)).toBeNull();
  });
});
