import type { EChartsCoreOption } from "echarts/core";
import type { SolarWindPoint } from "@/lib/api/client";

export type WindField = "speed_kms" | "density_cm3" | "bz_gsm_nt" | "bt_nt";

export interface ChartColors {
  line: string;
  text: string;
  grid: string;
}

interface LineInput {
  points: SolarWindPoint[];
  field: WindField;
  unit: string;
  utc: boolean;
  colors: ChartColors;
}

/** One time series with a unit on the value axis. Gaps stay null so the line breaks there. */
export function lineOption({ points, field, unit, utc, colors }: LineInput) {
  return {
    useUTC: utc,
    animation: false,
    grid: { left: 56, right: 16, top: 28, bottom: 28 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "time",
      axisLabel: { color: colors.text },
      axisLine: { lineStyle: { color: colors.grid } },
    },
    yAxis: {
      type: "value",
      name: unit,
      scale: true,
      nameTextStyle: { color: colors.text },
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.grid } },
    },
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
