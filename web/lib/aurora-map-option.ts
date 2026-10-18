import type { LinesSeriesOption, ScatterSeriesOption } from "echarts/charts";
import type { GeoComponentOption } from "echarts/components";
import { auroraLatitude } from "./aurora-gnss";
import type { ChartColors } from "./chart-options";
import { boundaryRing } from "./geomag";

export interface AuroraRing {
  kind: "likely" | "high";
  hemisphere: "north" | "south";
  magLat: number;
  ring: [lon: number, lat: number][];
}

/** The aurora's equatorward edge in both hemispheres, for the likely and the could-reach Kp. Empty below Kp 5. */
export function auroraRings(likelyKp: number, highKp: number): AuroraRing[] {
  return (
    [
      ["likely", likelyKp],
      ["high", highKp],
    ] as const
  ).flatMap(([kind, kp]) => {
    const lat = auroraLatitude(kp);

    return lat === null
      ? []
      : [
          { kind, hemisphere: "north" as const, magLat: lat, ring: boundaryRing(lat) },
          { kind, hemisphere: "south" as const, magLat: -lat, ring: boundaryRing(-lat) },
        ];
  });
}

export interface MapMarker {
  name: string;
  lat: number;
  lon: number;
}

export function auroraMapOption({
  likelyKp,
  highKp,
  colors,
  marker,
}: {
  likelyKp: number;
  highKp: number;
  colors: ChartColors;
  marker?: MapMarker | null;
}) {
  const rings = auroraRings(likelyKp, highKp);

  const geo: GeoComponentOption = {
    map: "world-land",
    roam: false,
    silent: true,
    aspectScale: 1,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    itemStyle: { areaColor: colors.grid, borderColor: colors.text, borderWidth: 0.4 },
  };

  const lines: LinesSeriesOption[] = rings.map((r) => ({
    type: "lines",
    name: `${r.kind}-${r.hemisphere}`,
    coordinateSystem: "geo",
    polyline: true,
    silent: true,
    data: [{ coords: r.ring }],
    lineStyle:
      r.kind === "likely"
        ? { color: colors.line, width: 2.5 }
        : { color: colors.uncertainty, width: 2, type: "dashed" },
  }));

  const place: ScatterSeriesOption[] = marker
    ? [
        {
          type: "scatter",
          name: "place",
          coordinateSystem: "geo",
          z: 5,
          data: [{ name: marker.name, value: [marker.lon, marker.lat] }],
          symbolSize: 11,
          itemStyle: { color: colors.line, borderColor: colors.grid, borderWidth: 2 },
          label: { show: true, formatter: "{b}", position: "right", color: colors.line, fontWeight: 600 },
        },
      ]
    : [];

  return { geo, series: [...lines, ...place] };
}
