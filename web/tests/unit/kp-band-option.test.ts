import { describe, expect, it } from "vitest";
import type { KpForecast } from "@/lib/api/client";
import { bandOption } from "@/lib/chart-options";

const COLORS = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd", band: "#fe6e00" };

const fc: KpForecast = {
  issued_at: "2024-05-10T18:00:00Z",
  model_version: "test",
  data_stale: false,
  horizons: [
    { horizon_h: 1, p10: 3, p50: 4, p90: 6 },
    { horizon_h: 6, p10: 2, p50: 5, p90: 8 },
  ],
};

const at = (h: number) => Date.parse("2024-05-10T18:00:00Z") + h * 3600 * 1000;

describe("bandOption", () => {
  it("places each horizon at issue time plus h hours", () => {
    const o = bandOption({ forecast: fc, utc: true, colors: COLORS });
    expect(o.series[2]!.data).toEqual([[at(1), 4], [at(6), 5]]);
  });

  it("stacks the p10 to p90 spread on p10", () => {
    const o = bandOption({ forecast: fc, utc: true, colors: COLORS });
    expect(o.series[0]!.data).toEqual([[at(1), 3], [at(6), 2]]);
    expect(o.series[1]!.data).toEqual([[at(1), 3], [at(6), 6]]);
    expect(o.series[0]!.stack).toBe(o.series[1]!.stack);
  });

  it("draws the band at 60% opacity in the band color, with Kp on the axis", () => {
    const o = bandOption({ forecast: fc, utc: false, colors: COLORS });
    expect(o.series[1]!.areaStyle).toEqual({ color: "#fe6e00", opacity: 0.6 });
    expect(o.yAxis.name).toBe("Kp");
    expect(o.useUTC).toBe(false);
  });
});
