"use client";

import { useEffect, useMemo, useState } from "react";
import { EChart } from "@/components/charts/echart";
import { useChartColors } from "@/components/charts/use-chart-colors";
import { AURORA_FLOOR_LAT, auroraLatitude, reachLabel } from "@/lib/aurora-gnss";
import { auroraMapOption, auroraRings, type MapMarker } from "@/lib/aurora-map-option";

const GEOJSON = "/geo/world-land-110m.json";

function summary(likelyKp: number, highKp: number): string {
  const likely = auroraLatitude(likelyKp);

  if (likely === null && auroraLatitude(highKp) === null) {
    return `Map of the world: the aurora stays poleward of ${AURORA_FLOOR_LAT}° geomagnetic latitude.`;
  }

  if (likely === null) {
    return `Map of the world: the aurora stays poleward of ${AURORA_FLOOR_LAT}° geomagnetic latitude, and could reach ${reachLabel(highKp)} geomagnetic latitude.`;
  }

  return `Map of the world: the aurora may be seen down to ${reachLabel(likelyKp)} geomagnetic latitude, and could reach ${reachLabel(highKp)}.`;
}

/** World map of the aurora's equatorward edge. The land outline loads once; if it fails the tables carry the same facts. */
export function AuroraMap({
  likelyKp,
  highKp,
  marker,
  Chart = EChart,
}: {
  likelyKp: number;
  highKp: number;
  marker: MapMarker | null;
  Chart?: typeof EChart;
}) {
  const colors = useChartColors();
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(GEOJSON);

        if (!res.ok) throw new Error(`land outline ${res.status}`);

        const [land, { registerMap }] = await Promise.all([res.json(), import("@/lib/echarts")]);

        registerMap("world-land", land);

        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const option = useMemo(() => auroraMapOption({ likelyKp, highKp, colors, marker }), [likelyKp, highKp, colors, marker]);

  if (state === "failed") {
    return <p className="text-sm text-muted">Map unavailable; the table below has the same information.</p>;
  }

  if (state === "loading") return <p className="flex h-72 w-full items-center text-sm text-muted md:h-96">Loading map…</p>;

  const hasLines = auroraRings(likelyKp, highKp).length > 0;

  return (
    <>
      <Chart option={option} label={summary(likelyKp, highKp)} heightClass="h-72 md:h-96" />
      <p className="mt-2 text-xs text-muted">
        {hasLines
          ? "The aurora may be seen on the pole side of the solid line. The dashed line is how far it could reach. Lines are drawn from geomagnetic latitude, so they do not follow the map's latitudes."
          : `The aurora stays poleward of ${AURORA_FLOOR_LAT}° geomagnetic latitude, so there is no line to draw at this Kp.`}
      </p>
    </>
  );
}
