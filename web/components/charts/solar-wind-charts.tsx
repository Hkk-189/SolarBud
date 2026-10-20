"use client";

import { useMemo } from "react";
import { Card, Empty } from "@/components/cards/card";
import { EChart } from "./echart";
import { TimeZoneToggle, useTimeZone } from "./time-zone";
import { useChartColors } from "./use-chart-colors";
import { useLive } from "./use-live";
import type { SolarWindPoint } from "@/lib/api/client";
import { EXPLAIN } from "@/lib/explanations";
import { type WindField, lineOption } from "@/lib/chart-options";

const SERIES: { field: WindField; label: string; unit: string }[] = [
  { field: "speed_kms", label: "Speed", unit: "km/s" },
  { field: "density_cm3", label: "Density", unit: "cm⁻³" },
  { field: "bz_gsm_nt", label: "Bz (GSM)", unit: "nT" },
  { field: "bt_nt", label: "Bt", unit: "nT" },
];

interface Props {
  initial: SolarWindPoint[] | null;
  /** The canvas renderer; tests pass a stand-in because jsdom has no canvas. */
  Chart?: typeof EChart;
}

export function SolarWindCharts({ initial, Chart = EChart }: Props) {
  const { utc } = useTimeZone();
  const colors = useChartColors();

  const { data, isError } = useLive<SolarWindPoint[]>("solar-wind-24h", "/api/solar-wind", initial);

  const options = useMemo(
    () =>
      data
        ? SERIES.map((s) => lineOption({ points: data, field: s.field, unit: s.unit, utc, colors }))
        : [],
    [data, utc, colors],
  );

  const title = "Solar wind, last 24 h";

  if (!data) {
    return (
      <Card title={title}>
        <Empty>{isError ? "Solar wind history unavailable." : "Loading solar wind history…"}</Empty>
      </Card>
    );
  }

  return (
    <Card title={title} explain={EXPLAIN.solarWindCharts}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {isError ? "Refresh failed, showing the last data." : "Updates every 5 min."}
        </p>
        <TimeZoneToggle />
      </div>
      {data.length === 0 ? (
        <Empty>No solar wind data in the last 24 h.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {SERIES.map((s, i) => (
            <figure key={s.field}>
              <figcaption className="text-xs font-semibold text-muted">
                {s.label}
              </figcaption>
              <Chart option={options[i] ?? {}} label={`${s.label} over the last 24 hours`} />
            </figure>
          ))}
        </div>
      )}
    </Card>
  );
}
