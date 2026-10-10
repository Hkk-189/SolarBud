"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, Empty } from "@/components/cards/card";
import { EChart } from "./echart";
import { TimeZoneToggle, useTimeZone } from "./time-zone";
import { REFRESH_MS, useChartColors } from "./use-chart-colors";
import type { KpForecast } from "@/lib/api/client";
import { bandOption } from "@/lib/chart-options";

async function fetchForecast(): Promise<KpForecast> {
  const res = await fetch("/api/kp-forecast");

  if (!res.ok) throw new Error(`kp forecast ${res.status}`);

  return res.json();
}

interface Props {
  initial: KpForecast | null;
  /** The canvas renderer; tests pass a stand-in because jsdom has no canvas. */
  Chart?: typeof EChart;
}

export function KpBandChart({ initial, Chart = EChart }: Props) {
  const { utc } = useTimeZone();
  const colors = useChartColors();

  const { data, isError } = useQuery({
    queryKey: ["kp-forecast"],
    queryFn: fetchForecast,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });

  const option = useMemo(
    () => (data ? bandOption({ forecast: data, utc, colors }) : {}),
    [data, utc, colors],
  );

  const title = "Kp forecast, next 6 h";

  if (!data) {
    return (
      <Card title={title}>
        <Empty>{isError ? "Kp forecast unavailable." : "Loading Kp forecast…"}</Empty>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {data.data_stale
            ? "Based on stale L1 data. Treat with caution."
            : "Median with the p10 to p90 range."}
        </p>
        <TimeZoneToggle />
      </div>
      <Chart option={option} label="Kp forecast for the next 6 hours, median with p10 to p90 band" />
    </Card>
  );
}
