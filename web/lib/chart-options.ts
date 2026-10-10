import type { EChartsCoreOption } from "echarts/core";
import type { KpForecast, SolarWindPoint } from "@/lib/api/client";

export type WindField = "speed_kms" | "density_cm3" | "bz_gsm_nt" | "bt_nt";

export interface ChartColors {
  line: string;
  text: string;
  grid: string;
  /** Brand orange for forecast uncertainty bands only, never for storm severity. */
  band: string;
}

interface LineInput {
  points: SolarWindPoint[];
  field: WindField;
  unit: string;
  utc: boolean;
  colors: ChartColors;
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

type Pair = [number, number];

interface BandSeries {
  type: "line";
  data: Pair[];
  stack?: string;
  showSymbol: boolean;
  lineStyle: { color?: string; width?: number; opacity?: number };
  itemStyle?: { color: string };
  areaStyle?: { color: string; opacity: number };
}

interface BandInput {
  forecast: KpForecast;
  utc: boolean;
  colors: ChartColors;
}

/** p10 to p90 as a translucent band (an invisible p10 base with the spread stacked on it) under the median. */
export function bandOption({ forecast, utc, colors }: BandInput) {
  const t0 = Date.parse(forecast.issued_at);
  const at = (h: number) => t0 + h * 3600 * 1000;
  const hidden = { opacity: 0 };

  const series: BandSeries[] = [
    {
      type: "line",
      stack: "band",
      showSymbol: false,
      lineStyle: hidden,
      data: forecast.horizons.map((h): Pair => [at(h.horizon_h), h.p10]),
    },
    {
      type: "line",
      stack: "band",
      showSymbol: false,
      lineStyle: hidden,
      areaStyle: { color: colors.band, opacity: 0.6 },
      data: forecast.horizons.map((h): Pair => [at(h.horizon_h), h.p90 - h.p10]),
    },
    {
      type: "line",
      showSymbol: true,
      lineStyle: { color: colors.line, width: 2 },
      itemStyle: { color: colors.line },
      data: forecast.horizons.map((h): Pair => [at(h.horizon_h), h.p50]),
    },
  ];

  return {
    useUTC: utc,
    animation: false,
    grid: GRID,
    xAxis: xAxis(colors),
    yAxis: { type: "value", name: "Kp", min: 0, max: 9, interval: 3, ...yAxisStyle(colors) },
    series,
  } satisfies EChartsCoreOption;
}
