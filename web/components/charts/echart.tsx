"use client";

import type { ECharts, EChartsCoreOption } from "echarts/core";
import { useEffect, useRef } from "react";

/** ECharts has no SSR (canvas), so it is loaded after hydration and the box keeps its height. */
export function EChart({
  option,
  label,
  heightClass = "h-48",
}: {
  option: EChartsCoreOption;
  label: string;
  heightClass?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const latest = useRef(option);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;

    void import("@/lib/echarts").then(({ init }) => {
      if (disposed || !box.current) return;
      chart.current = init(box.current);
      chart.current.setOption(latest.current);
      observer = new ResizeObserver(() => chart.current?.resize());
      observer.observe(box.current);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    latest.current = option;
    chart.current?.setOption(option, true);
  }, [option]);

  return <div ref={box} role="img" aria-label={label} className={`${heightClass} w-full`} />;
}
