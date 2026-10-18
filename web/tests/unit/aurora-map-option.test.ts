import { describe, expect, it } from "vitest";
import { auroraMapOption, auroraRings } from "@/lib/aurora-map-option";
import { geomagneticLatitude } from "@/lib/geomag";

const colors = { line: "#111111", text: "#666666", grid: "#dddddd", band: "#fe6e00", g1: "#874b00", uncertainty: "#c25100" };

describe("auroraRings", () => {
  it("draws a ring per hemisphere for the likely and the could-reach Kp at the table's latitudes", () => {
    const rings = auroraRings(7, 8);

    expect(rings.map((r) => [r.kind, r.hemisphere, r.magLat])).toEqual([
      ["likely", "north", 52],
      ["likely", "south", -52],
      ["high", "north", 50],
      ["high", "south", -50],
    ]);

    for (const r of rings) {
      for (const [lon, lat] of r.ring) expect(geomagneticLatitude(lat, lon)).toBeCloseTo(r.magLat, 1);
    }
  });
  it("draws nothing for a Kp below 5, and only the could-reach rings when only that reaches 5", () => {
    expect(auroraRings(4.9, 4.9)).toEqual([]);
    expect(auroraRings(3, 6).map((r) => r.kind)).toEqual(["high", "high"]);
  });
});

describe("auroraMapOption", () => {
  it("has the land and a line per ring", () => {
    const option = auroraMapOption({ likelyKp: 7, highKp: 8, colors });

    expect(option.series).toHaveLength(4);
  });
  it("adds one marker for a chosen place", () => {
    const base = auroraMapOption({ likelyKp: 7, highKp: 8, colors }).series.length;
    const marked = auroraMapOption({ likelyKp: 7, highKp: 8, colors, marker: { name: "Delhi", lat: 28.61, lon: 77.21 } });

    expect(marked.series).toHaveLength(base + 1);
  });
  it("still shows the land and the marker when no ring reaches Kp 5", () => {
    const option = auroraMapOption({ likelyKp: 2, highKp: 3, colors, marker: { name: "Delhi", lat: 28.61, lon: 77.21 } });

    expect(option.series).toHaveLength(1);
    expect(option.geo.map).toBe("world-land");
  });
});
