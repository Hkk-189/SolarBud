"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Card, Empty } from "@/components/cards/card";
import { EChart } from "./echart";
import type { SolarWindPoint } from "@/lib/api/client";
import { type ChartColors, type WindField, lineOption } from "@/lib/chart-options";

const SERIES: { field: WindField; label: string; unit: string }[] = [
  { field: "speed_kms", label: "Speed", unit: "km/s" },
  { field: "density_cm3", label: "Density", unit: "cm⁻³" },
  { field: "bz_gsm_nt", label: "Bz (GSM)", unit: "nT" },
  { field: "bt_nt", label: "Bt", unit: "nT" },
];

const FALLBACK: ChartColors = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd" };

const REFRESH_MS = 5 * 60 * 1000; // the worker's forecast cadence

async function fetchWindow(): Promise<SolarWindPoint[]> {
  const res = await fetch("/api/solar-wind");

  if (!res.ok) throw new Error(`solar wind ${res.status}`);

  return res.json();
}

/** Canvas cannot read CSS variables, so resolve the theme tokens and follow the OS scheme. */
function useChartColors(): ChartColors {
  const [colors, setColors] = useState(FALLBACK);

  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      setColors({
        line: v("--foreground", FALLBACK.line),
        text: v("--muted", FALLBACK.text),
        grid: v("--outline", FALLBACK.grid),
      });
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    read();
    media.addEventListener("change", read);

    return () => media.removeEventListener("change", read);
  }, []);

  return colors;
}

interface Props {
  initial: SolarWindPoint[] | null;
  /** The canvas renderer; tests pass a stand-in because jsdom has no canvas. */
  Chart?: typeof EChart;
}

export function SolarWindCharts({ initial, Chart = EChart }: Props) {
  const [utc, setUtc] = useState(true);
  const colors = useChartColors();

  const { data, isError } = useQuery({
    queryKey: ["solar-wind-24h"],
    queryFn: fetchWindow,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });

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
    <Card title={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {isError ? "Refresh failed, showing the last data." : "Updates every 5 min."}
        </p>
        <button
          type="button"
          aria-pressed={utc}
          onClick={() => setUtc(!utc)}
          className="rounded-card border border-outline px-3 py-1 text-xs font-semibold"
        >
          {utc ? "UTC" : "Local time"}
        </button>
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
