import type { EChartsCoreOption } from "echarts/core";
import type { KpForecast, KpPoint, SolarWindPoint } from "@/lib/api/client";
import { G1_KP } from "@/lib/g-level";

export type WindField = "speed_kms" | "density_cm3" | "bz_gsm_nt" | "bt_nt";

export interface ChartColors {
  line: string;
  text: string;
  grid: string;
  /** Brand orange for forecast uncertainty bands only, never for storm severity. */
  band: string;
  /** The G1 threshold line; a G-scale color, never brand orange. */
  g1: string;
}

interface LineInput {
  points: SolarWindPoint[];
  field: WindField;
  unit: string;
  utc: boolean;
  colors: ChartColors;
  /** The forecast is older than the worker cadence allows: the marker says so instead of "now". */
  old?: boolean;
}

const GRID = { left: 56, right: 16, top: 28, bottom: 28 };

const xAxis = (c: ChartColors) => ({
  type: "time",
  axisLabel: { color: c.text },
  axisLine: { lineStyle: { color: c.grid } },
});

const yAxisStyle = (c: ChartColors) => ({
  nameTextStyle: { color: c.text },
  axisLabel: { color: c.text },
  splitLine: { lineStyle: { color: c.grid } },
});

/** One time series with a unit on the value axis. Gaps stay null so the line breaks there. */
export function lineOption({ points, field, unit, utc, colors }: LineInput) {
  return {
    useUTC: utc,
    animation: false,
    grid: GRID,
    tooltip: { trigger: "axis" },
    xAxis: xAxis(colors),
    yAxis: { type: "value", name: unit, scale: true, ...yAxisStyle(colors) },
    series: [
      {
        type: "line",
        showSymbol: false,
        lineStyle: { color: colors.line, width: 1.5 },
        itemStyle: { color: colors.line },
        data: points.map((p) => [Date.parse(p.time), p[field] ?? null]),
      },
    ],
  } satisfies EChartsCoreOption;
}

type Point = (number | null)[];

interface MarkDatum {
  xAxis?: number;
  yAxis?: number;
  label: { formatter: string; color: string; position: "insideEndTop" | "end" };
  lineStyle: { color: string; type: "dashed" | "solid" };
}

interface BandSeries {
  type: "line";
  name?: string;
  data: Point[] | { name: string; value: number[] }[];
  stack?: string;
  showSymbol: boolean;
  lineStyle: { color?: string; width?: number; opacity?: number };
  itemStyle?: { color: string };
  areaStyle?: { color: string; opacity: number };
  tooltip?: { show: false };
  dimensions?: (string | { name: string; displayName: string })[];
  encode?: { x: number; y: number; tooltip: number[] };
  markLine?: { silent: true; symbol: "none"; data: MarkDatum[] };
}

interface BandInput {
  forecast: KpForecast;
  observed: KpPoint[];
  utc: boolean;
  colors: ChartColors;
  /** The forecast is older than the worker cadence allows: the marker says "last forecast" instead of "now". */
  old?: boolean;
}

const HOUR_MS = 3600 * 1000;

const BIN_MS = 3 * HOUR_MS;

const round1 = (x: number) => Math.round(x * 10) / 10;

/** Each 3 h bin as a flat segment from its start to its end; null Kp and missing bins break the line. */
function observedSteps(observed: KpPoint[]): Point[] {
  const out: Point[] = [];
  let prevEnd: number | null = null;

  for (const p of observed) {
    const t = Date.parse(p.time);
    const kp = p.kp ?? null;

    if (prevEnd !== null && t > prevEnd) out.push([prevEnd, null]);
    out.push([t, kp], [t + BIN_MS, kp]);
    prevEnd = t + BIN_MS;
  }

  return out;
}

/**
 * Observed Kp steps, then p10 to p90 as a translucent band (an invisible p10 base with the spread
 * stacked on it) under the median, with the G1 threshold and the issue time ("now") marked.
 */
export function bandOption({ forecast, observed, utc, colors, old = false }: BandInput) {
  const t0 = Date.parse(forecast.issued_at);
  const at = (h: number) => t0 + h * HOUR_MS;
  const hidden = { opacity: 0 };
  const noTooltip = { show: false } as const;

  const series: BandSeries[] = [
    {
      type: "line",
      stack: "band",
      showSymbol: false,
      lineStyle: hidden,
      tooltip: noTooltip,
      data: forecast.horizons.map((h) => [at(h.horizon_h), h.p10]),
    },
    {
      type: "line",
      stack: "band",
      showSymbol: false,
      lineStyle: hidden,
      tooltip: noTooltip,
      areaStyle: { color: colors.band, opacity: 0.6 },
      data: forecast.horizons.map((h) => [at(h.horizon_h), h.p90 - h.p10]),
    },
    {
      type: "line",
      name: "Kp forecast",
      showSymbol: true,
      lineStyle: { color: colors.line, width: 2 },
      itemStyle: { color: colors.line },
      // The default item tooltip lists the encoded dimensions, so no formatter callback is needed
      // (a string template cannot read extra dimensions in a tooltip, only in a label).
      dimensions: ["time", { name: "p50", displayName: "Median" }, "p10", "p90"],
      encode: { x: 0, y: 1, tooltip: [1, 2, 3] },
      data: forecast.horizons.map((h) => ({
        name: `+${h.horizon_h} h`,
        value: [at(h.horizon_h), round1(h.p50), round1(h.p10), round1(h.p90)],
      })),
      markLine: {
        silent: true,
        symbol: "none",
        data: [
          {
            yAxis: G1_KP,
            label: { formatter: "G1 (Kp 5-)", color: colors.g1, position: "insideEndTop" },
            lineStyle: { color: colors.g1, type: "dashed" },
          },
          { xAxis: t0, label: { formatter: old ? "last forecast" : "now", color: colors.text, position: "end" }, lineStyle: { color: colors.text, type: "solid" } },
        ],
      },
    },
    {
      type: "line",
      name: "Observed Kp",
      showSymbol: false,
      lineStyle: { color: colors.text, width: 2 },
      itemStyle: { color: colors.text },
      data: observedSteps(observed),
    },
  ];

  return {
    useUTC: utc,
    animation: false,
    grid: GRID,
    tooltip: { trigger: "item" },
    xAxis: xAxis(colors),
    yAxis: { type: "value", name: "Kp", min: 0, max: 9, interval: 3, ...yAxisStyle(colors) },
    series,
  } satisfies EChartsCoreOption;
}
