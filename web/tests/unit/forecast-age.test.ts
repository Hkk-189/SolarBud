import { describe, expect, it } from "vitest";
import { MAX_FORECAST_AGE_MS, forecastIsOld } from "@/lib/forecast-age";

const ISSUED = "2026-10-11T09:00:00Z";

const T0 = Date.parse(ISSUED);

describe("forecastIsOld", () => {
  it("allows 15 minutes, which is three worker cycles", () => {
    expect(MAX_FORECAST_AGE_MS).toBe(15 * 60 * 1000);
    expect(forecastIsOld(ISSUED, T0 + MAX_FORECAST_AGE_MS)).toBe(false);
  });

  it("is old one millisecond past the limit", () => {
    expect(forecastIsOld(ISSUED, T0 + MAX_FORECAST_AGE_MS + 1)).toBe(true);
  });

  it("is not old when the clock is behind the issue time", () => {
    expect(forecastIsOld(ISSUED, T0 - 60_000)).toBe(false);
  });
});
