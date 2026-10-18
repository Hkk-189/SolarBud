// Centred-dipole geomagnetic coordinates. Pole: NOAA NCEI WMM2025 / IGRF-14, epoch 2025.0 (80.85 N, 72.76 W).
// A rough model on purpose: the aurora rule in aurora-gnss.ts is itself a rough rule from Kp alone.
export const GEOMAG_POLE = { lat: 80.85, lon: -72.76 };

const RAD = Math.PI / 180;

const sinPole = Math.sin(GEOMAG_POLE.lat * RAD);

const cosPole = Math.cos(GEOMAG_POLE.lat * RAD);

export function geomagneticLatitude(lat: number, lon: number): number {
  const s = sinPole * Math.sin(lat * RAD) + cosPole * Math.cos(lat * RAD) * Math.cos((lon - GEOMAG_POLE.lon) * RAD);

  return Math.asin(Math.max(-1, Math.min(1, s))) / RAD;
}

/** Geographic latitude at one longitude where the geomagnetic latitude is `magLat`, or null if none. */
function latAt(lon: number, magLat: number): number | null {
  const a = sinPole;
  const b = cosPole * Math.cos((lon - GEOMAG_POLE.lon) * RAD);
  const r = Math.hypot(a, b);
  const s = Math.sin(magLat * RAD) / r;

  if (Math.abs(s) > 1) return null;

  const delta = Math.atan2(b, a);

  const inRange = [Math.asin(s) - delta, Math.PI - Math.asin(s) - delta].flatMap((x) => {
    const wrapped = Math.atan2(Math.sin(x), Math.cos(x));

    return Math.abs(wrapped) <= Math.PI / 2 + 1e-9 ? [wrapped] : [];
  });

  if (inRange.length === 0) return null;

  // Both roots only happen well away from the poles; prefer the one nearer the hemisphere's pole.
  return (magLat >= 0 ? Math.max(...inRange) : Math.min(...inRange)) / RAD;
}

/** Geographic points where geomagnetic latitude equals `magLat`, one per degree of longitude, sorted by longitude. */
export function boundaryRing(magLat: number, steps = 360): [lon: number, lat: number][] {
  const ring: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const lon = -180 + (360 * i) / steps;
    const lat = latAt(lon, magLat);

    if (lat !== null) ring.push([lon, lat]);
  }

  return ring;
}
