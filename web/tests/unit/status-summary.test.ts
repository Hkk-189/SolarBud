import { describe, expect, it } from "vitest";
import type { AlertStatus, ApiResult, KpForecast } from "@/lib/api/client";
import { statusSummary } from "@/lib/status-summary";

const ISSUED = "2026-10-11T09:00:00Z";

const NOW = Date.parse(ISSUED) + 60_000;

const OUT_OF_DATE = "The latest forecast is out of date, so treat the numbers below with caution.";

const NO_FORECAST = "We can't reach a current forecast, so we can't say whether a storm is coming.";

const ACTIVE = "A geomagnetic storm (G1 or stronger) is happening now.";

const WARNING = "A geomagnetic storm (G1 or stronger) is likely within the next 6 hours.";

const QUIET = "Quiet: no geomagnetic storm expected in the next 6 hours.";

const forecast = (p50s: number[], over: Partial<KpForecast> = {}): ApiResult<KpForecast> => ({
  ok: true,
  data: {
    data_stale: false,
    issued_at: ISSUED,
    model_version: "t",
    horizons: p50s.map((p50, i) => ({ horizon_h: i + 1, p10: p50 - 1, p50, p90: p50 + 1 })),
    ...over,
  },
});

const alert = (level: string): ApiResult<AlertStatus> => ({ ok: true, data: { level } });

const down = { ok: false } as const;

describe("statusSummary", () => {
  it("never says quiet when the forecast is missing", () => {
    expect(statusSummary(down, alert("none"), NOW)).toBe(NO_FORECAST);
  });

  it("says out of date for an old forecast", () => {
    expect(statusSummary(forecast([2]), alert("none"), NOW + 20 * 60_000)).toBe(OUT_OF_DATE);
  });

  it("says out of date for data_stale", () => {
    expect(statusSummary(forecast([2], { data_stale: true }), alert("none"), NOW)).toBe(OUT_OF_DATE);
  });

  it("out of date wins over an active alert", () => {
    expect(statusSummary(forecast([2]), alert("active"), NOW + 20 * 60_000)).toBe(OUT_OF_DATE);
  });

  it("reports an active storm", () => {
    expect(statusSummary(forecast([2]), alert("active"), NOW)).toBe(ACTIVE);
  });

  it("reports a warning", () => {
    expect(statusSummary(forecast([2]), alert("warning"), NOW)).toBe(WARNING);
  });

  it("reports raised activity from the highest p50", () => {
    expect(statusSummary(forecast([3, 5.2, 4]), alert("none"), NOW)).toBe(
      "Activity is raised: the forecast touches G1, but not confidently enough for a warning.",
    );
  });

  it("is quiet for a quiet forecast", () => {
    expect(statusSummary(forecast([2, 3]), alert("none"), NOW)).toBe(QUIET);
  });

  it("is quiet when the alert is down and the forecast is quiet", () => {
    expect(statusSummary(forecast([2]), down, NOW)).toBe(QUIET);
  });

  it("an unknown alert level falls through to the forecast", () => {
    expect(statusSummary(forecast([2]), alert("watch"), NOW)).toBe(QUIET);
    expect(statusSummary(forecast([6]), alert("watch"), NOW)).toContain("touches G2");
  });

  it("boundary: 4.66 is quiet, 4.667 touches G1", () => {
    expect(statusSummary(forecast([4.66]), alert("none"), NOW)).toBe(QUIET);
    expect(statusSummary(forecast([4.667]), alert("none"), NOW)).toContain("touches G1");
  });
});
