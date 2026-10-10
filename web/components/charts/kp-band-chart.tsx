"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, Empty } from "@/components/cards/card";
import { EChart } from "./echart";
import { TimeZoneToggle, useTimeZone } from "./time-zone";
import { REFRESH_MS, useChartColors } from "./use-chart-colors";
import type { KpForecast, KpPoint } from "@/lib/api/client";
import { bandOption } from "@/lib/chart-options";

async function fetchForecast(): Promise<KpForecast> {
  const res = await fetch("/api/kp-forecast");

  if (!res.ok) throw new Error(`kp forecast ${res.status}`);

  return res.json();
}

async function fetchObserved(): Promise<KpPoint[]> {
  const res = await fetch("/api/kp-observed");

  if (!res.ok) throw new Error(`kp observed ${res.status}`);

  return res.json();
}

interface Props {
  initial: KpForecast | null;
  /** Observed Kp history; optional context, so its absence never hides the forecast. */
  initialObserved: KpPoint[] | null;
  /** The canvas renderer; tests pass a stand-in because jsdom has no canvas. */
  Chart?: typeof EChart;
}

export function KpBandChart({ initial, initialObserved, Chart = EChart }: Props) {
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

  const { data: observed } = useQuery({
    queryKey: ["kp-observed"],
    queryFn: fetchObserved,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initialObserved ?? undefined,
  });

  const option = useMemo(
    () => (data ? bandOption({ forecast: data, observed: observed ?? [], utc, colors }) : {}),
    [data, observed, utc, colors],
  );

  const title = "Kp, last 24 h and next 6 h";

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
            : "Observed Kp, then the forecast median with its p10 to p90 range. Dashed line: G1 storm threshold (Kp 5-)."}
        </p>
        <TimeZoneToggle />
      </div>
      <Chart option={option} label="Observed Kp for the last 24 hours and the forecast for the next 6 hours, median with p10 to p90 band and the G1 threshold" />
    </Card>
  );
}
