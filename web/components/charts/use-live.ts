"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_MS } from "./use-chart-colors";

/** Data from a same-origin /api route, refreshed on the worker's cadence. `initial` is what the server already fetched. */
export function useLive<T>(key: string, path: string, initial: T | null) {
  const { data, isError, dataUpdatedAt } = useQuery({
    queryKey: [key],
    queryFn: async (): Promise<T> => {
      const res = await fetch(path);

      if (!res.ok) throw new Error(`${key} ${res.status}`);

      return res.json();
    },
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
    retry: 1,
    initialData: initial ?? undefined,
  });

  return { data, isError, updatedAt: dataUpdatedAt };
}
