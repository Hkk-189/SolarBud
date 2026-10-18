import { describe, expect, it } from "vitest";
import { boundaryRing, GEOMAG_POLE, geomagneticLatitude } from "@/lib/geomag";
import { PLACES } from "@/lib/places";

describe("geomagneticLatitude (centred dipole, pole 80.85N 72.76W)", () => {
  it("is 90 at the geomagnetic north pole and -90 at its antipode", () => {
    expect(geomagneticLatitude(GEOMAG_POLE.lat, GEOMAG_POLE.lon)).toBeCloseTo(90, 1);
    expect(geomagneticLatitude(-GEOMAG_POLE.lat, GEOMAG_POLE.lon + 180)).toBeCloseTo(-90, 1);
  });
  it("puts Delhi well equatorward of Tromsø", () => {
    const delhi = geomagneticLatitude(28.61, 77.21);
    const tromso = geomagneticLatitude(69.65, 18.96);

    expect(delhi).toBeGreaterThan(15);
    expect(delhi).toBeLessThan(25);
    expect(tromso).toBeGreaterThan(65);
  });
});

describe.each([56, 47, -56])("boundaryRing(%d)", (m) => {
  const ring = boundaryRing(m);

  it("round-trips to the requested geomagnetic latitude", () => {
    for (const [lon, lat] of ring) expect(geomagneticLatitude(lat, lon)).toBeCloseTo(m, 1);
  });
  it("is sorted by longitude inside [-180, 180] so it cannot streak across the dateline", () => {
    const lons = ring.map(([lon]) => lon);

    expect(Math.min(...lons)).toBeGreaterThanOrEqual(-180);
    expect(Math.max(...lons)).toBeLessThanOrEqual(180);
    expect(lons).toEqual([...lons].sort((a, b) => a - b));
  });
});

describe("PLACES", () => {
  it("are inside valid coordinate bounds and include India and the aurora zone", () => {
    for (const p of PLACES) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(p.lon)).toBeLessThanOrEqual(180);
    }

    expect(PLACES.map((p) => p.name)).toEqual(expect.arrayContaining(["Delhi", "Leh", "Tromsø"]));
  });
});
