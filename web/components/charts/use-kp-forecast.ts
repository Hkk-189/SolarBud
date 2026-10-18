"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_MS } from "./use-chart-colors";
import type { KpForecast } from "@/lib/api/client";

async function fetchForecast(): Promise<KpForecast> {
  const res = await fetch("/api/kp-forecast");

  if (!res.ok) throw new Error(`kp forecast ${res.status}`);

  return res.json();
}

/** The latest Kp forecast, refreshed on the worker's cadence. `initial` is what the server already fetched. */
export function useKpForecast(initial: KpForecast | null) {
  const { data, isError, dataUpdatedAt } = useQuery({
    queryKey: ["kp-forecast"],
    queryFn: fetchForecast,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });

  return { data, isError, updatedAt: dataUpdatedAt };
}
