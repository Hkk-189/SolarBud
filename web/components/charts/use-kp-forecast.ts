"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_MS } from "./use-chart-colors";
import type { AlertStatus, KpForecast, KpPoint } from "@/lib/api/client";

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

async function fetchObserved(): Promise<KpPoint[]> {
  const res = await fetch("/api/kp-observed");

  if (!res.ok) throw new Error(`kp observed ${res.status}`);

  return res.json();
}

/** Observed Kp for the last day; context only, so a failure never hides the forecast. */
export function useKpObserved(initial: KpPoint[] | null) {
  return useQuery({
    queryKey: ["kp-observed"],
    queryFn: fetchObserved,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });
}

async function fetchAlert(): Promise<AlertStatus> {
  const res = await fetch("/api/alert-current");

  if (!res.ok) throw new Error(`alert ${res.status}`);

  return res.json();
}

export function useAlertCurrent(initial: AlertStatus | null) {
  return useQuery({
    queryKey: ["alert-current"],
    queryFn: fetchAlert,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });
}
