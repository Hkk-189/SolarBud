"use client";

import { useEffect, useState } from "react";
import type { ChartColors } from "@/lib/chart-options";

const FALLBACK: ChartColors = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd", band: "#fe6e00", g1: "#874b00", uncertainty: "#c25100" };

export const REFRESH_MS = 5 * 60 * 1000; // the worker's forecast cadence

/** Canvas cannot read CSS variables, so resolve the theme tokens and follow the OS scheme. */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState(FALLBACK);

  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      setColors({
        line: v("--foreground", FALLBACK.line),
        text: v("--muted", FALLBACK.text),
        grid: v("--outline", FALLBACK.grid),
        band: v("--primary", FALLBACK.band),
        g1: v("--g1-line", FALLBACK.g1),
        uncertainty: v("--uncertainty", FALLBACK.uncertainty),
      });
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    read();
    media.addEventListener("change", read);

    return () => media.removeEventListener("change", read);
  }, []);

  return colors;
}
