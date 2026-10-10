import { describe, expect, it } from "vitest";
import { lineOption } from "@/lib/chart-options";
import type { SolarWindPoint } from "@/lib/api/client";

const COLORS = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd", band: "#fe6e00" };

const pts: SolarWindPoint[] = [
  { time: "2024-05-10T18:00:00Z", speed_kms: 500, bz_gsm_nt: -5 },
  { time: "2024-05-10T18:01:00Z", speed_kms: null, bz_gsm_nt: -6 },
  { time: "2024-05-10T18:02:00Z", speed_kms: 510 },
];

describe("lineOption", () => {
  it("plots [ms, value] pairs and keeps gaps as null", () => {
    const o = lineOption({ points: pts, field: "speed_kms", unit: "km/s", utc: true, colors: COLORS });
    expect(o.series[0]!.data).toEqual([
      [Date.parse("2024-05-10T18:00:00Z"), 500],
      [Date.parse("2024-05-10T18:01:00Z"), null],
      [Date.parse("2024-05-10T18:02:00Z"), 510],
    ]);
  });

  it("puts the unit on the value axis", () => {
    const o = lineOption({ points: pts, field: "bz_gsm_nt", unit: "nT", utc: true, colors: COLORS });
    expect(o.yAxis.name).toBe("nT");
  });

  it("switches between UTC and local time", () => {
    const base = { points: pts, field: "speed_kms", unit: "km/s", colors: COLORS } as const;
    expect(lineOption({ ...base, utc: true }).useUTC).toBe(true);
    expect(lineOption({ ...base, utc: false }).useUTC).toBe(false);
  });
});
