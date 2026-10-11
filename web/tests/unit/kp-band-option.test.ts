import { describe, expect, it } from "vitest";
import type { KpForecast, KpPoint } from "@/lib/api/client";
import { bandOption } from "@/lib/chart-options";
import { G1_KP, gLevel } from "@/lib/g-level";

const COLORS = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd", band: "#fe6e00", g1: "#874b00" };

const fc: KpForecast = {
  issued_at: "2024-05-10T18:00:00Z",
  model_version: "test",
  data_stale: false,
  horizons: [
    { horizon_h: 1, p10: 3, p50: 4, p90: 6 },
    { horizon_h: 6, p10: 2, p50: 5, p90: 8 },
  ],
};

const H = 3600 * 1000;

const t0 = Date.parse("2024-05-10T18:00:00Z");

const at = (h: number) => t0 + h * H;

const observed: KpPoint[] = [
  { time: "2024-05-10T09:00:00Z", kp: 3 },
  { time: "2024-05-10T12:00:00Z", kp: null },
  { time: "2024-05-10T15:00:00Z", kp: 4.667 },
];

const opt = (obs: KpPoint[] = [], old = false) =>
  bandOption({ forecast: fc, observed: obs, utc: true, colors: COLORS, old });

describe("bandOption", () => {
  it("places each horizon at issue time plus h hours, carrying p10 and p90 for the tooltip", () => {
    expect(opt().series[2]!.data).toEqual([
      { name: "+1 h", value: [at(1), 4, 3, 6] },
      { name: "+6 h", value: [at(6), 5, 2, 8] },
    ]);
  });

  it("rounds the tooltip values to one decimal", () => {
    const o = bandOption({
      forecast: { ...fc, horizons: [{ horizon_h: 1, p10: 3.14159, p50: 4.33333, p90: 6.66667 }] },
      observed: [],
      utc: true,
      colors: COLORS,
    });

    expect(o.series[2]!.data).toEqual([{ name: "+1 h", value: [at(1), 4.3, 3.1, 6.7] }]);
  });

  it("stacks the p10 to p90 spread on p10", () => {
    const o = opt();
    expect(o.series[0]!.data).toEqual([[at(1), 3], [at(6), 2]]);
    expect(o.series[1]!.data).toEqual([[at(1), 3], [at(6), 6]]);
    expect(o.series[0]!.stack).toBe(o.series[1]!.stack);
  });

  it("draws the band at 60% opacity in the band color, with Kp on the axis", () => {
    const o = bandOption({ forecast: fc, observed: [], utc: false, colors: COLORS });
    expect(o.series[1]!.areaStyle).toEqual({ color: "#fe6e00", opacity: 0.6 });
    expect(o.yAxis.name).toBe("Kp");
    expect(o.useUTC).toBe(false);
  });

  it("shows p50, p10 and p90 in the median tooltip without a formatter callback", () => {
    const o = opt();
    expect(o.tooltip).toEqual({ trigger: "item" });
    expect(o.series[0]!.tooltip).toEqual({ show: false });
    expect(o.series[1]!.tooltip).toEqual({ show: false });
    expect(o.series[2]!.encode).toEqual({ x: 0, y: 1, tooltip: [1, 2, 3] });
    expect(o.series[2]!.dimensions).toHaveLength(4);
  });

  it("draws observed Kp as 3 h steps before the forecast, breaking at null bins", () => {
    const o = opt(observed);
    const t = (iso: string) => Date.parse(iso);
    expect(o.series[3]!.data).toEqual([
      [t("2024-05-10T09:00:00Z"), 3],
      [t("2024-05-10T12:00:00Z"), 3],
      [t("2024-05-10T12:00:00Z"), null],
      [t("2024-05-10T15:00:00Z"), null],
      [t("2024-05-10T15:00:00Z"), 4.667],
      [t("2024-05-10T18:00:00Z"), 4.667],
    ]);
    expect(o.series[3]!.lineStyle.color).toBe(COLORS.text);
  });

  it("breaks the observed line where a bin is missing instead of bridging it", () => {
    const o = opt([observed[0]!, observed[2]!]);
    expect(o.series[3]!.data).toEqual([
      [t0 - 9 * H, 3],
      [t0 - 6 * H, 3],
      [t0 - 6 * H, null],
      [t0 - 3 * H, 4.667],
      [t0, 4.667],
    ]);
  });

  it("still draws the band when there is no observed Kp", () => {
    const o = opt([]);
    expect(o.series[3]!.data).toEqual([]);
    expect(o.series[1]!.data).toHaveLength(2);
  });

  it("marks the G1 threshold where gLevel turns G1, and now at the issue time", () => {
    const marks = opt().series[2]!.markLine!.data;
    const g1 = marks.find((m) => m.yAxis !== undefined)!;
    expect(g1.yAxis).toBe(G1_KP);
    expect(gLevel(g1.yAxis!)).toBe(1);
    expect(g1.label.formatter).toContain("G1");
    expect(g1.lineStyle.color).toBe(COLORS.g1);
    const now = marks.find((m) => m.xAxis !== undefined)!;
    expect(now.xAxis).toBe(t0);
    expect(now.label.formatter).toBe("now");
  });

  it("labels the marker last forecast, not now, when the forecast is old", () => {
    const marks = opt([], true).series[2]!.markLine!.data;
    expect(marks.find((m) => m.xAxis !== undefined)!.label.formatter).toBe("last forecast");
  });
});
