"use client";

import { useEffect, useMemo, useState } from "react";
import { EChart } from "@/components/charts/echart";
import { useChartColors } from "@/components/charts/use-chart-colors";
import { AURORA_FLOOR_LAT, auroraLatitude } from "@/lib/aurora-gnss";
import { auroraMapOption, auroraRings, type MapMarker } from "@/lib/aurora-map-option";

const GEOJSON = "/geo/world-land-110m.json";

const deg = (kp: number) => {
  const lat = auroraLatitude(kp);

  return lat === null ? null : `${Math.round(lat)}°`;
};

function summary(likelyKp: number, highKp: number): string {
  const likely = deg(likelyKp);
  const high = deg(highKp);

  if (likely === null && high === null) return "Map of the world: the aurora stays poleward of 56° geomagnetic latitude.";

  if (likely === null) {
    return `Map of the world: the aurora stays poleward of 56° geomagnetic latitude, and could reach about ${high} geomagnetic latitude.`;
  }

  return `Map of the world: the aurora may be seen down to about ${likely} geomagnetic latitude, and could reach ${high ?? likely}.`;
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

  if (state === "loading") return <div className="h-72 w-full md:h-96" aria-hidden="true" />;

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
