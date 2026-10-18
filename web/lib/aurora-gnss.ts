import { gLevel } from "./g-level";

// docs/context.md "Aurora visibility (rough rule, v1 only)": equatorward edge in geomagnetic latitude.
const AURORA: [kp: number, lat: number][] = [
  [5, 56],
  [6, 54],
  [7, 52],
  [8, 50],
  [9, 47],
];

/** Edge at Kp 5, the weakest row of the table: below it the aurora lies poleward of this. */
export const AURORA_FLOOR_LAT = AURORA[0][1];

/** Geomagnetic latitude the aurora may reach, interpolated between whole Kp. Null below Kp 5. */
export function auroraLatitude(kp: number): number | null {
  if (Number.isNaN(kp) || kp < AURORA[0][0]) return null;

  const top = AURORA[AURORA.length - 1];

  if (kp >= top[0]) return top[1];

  const i = AURORA.findIndex(([k]) => k > kp) - 1;
  const [k0, l0] = AURORA[i];
  const [k1, l1] = AURORA[i + 1];

  return l0 + ((kp - k0) / (k1 - k0)) * (l1 - l0);
}

export type GnssRisk = "Low" | "Moderate" | "High" | "Severe";

// docs/context.md "GNSS risk mapping (v1 heuristic)": < G1 Low, G1-G2 Moderate, G3 High, G4-G5 Severe.
const RISK_BY_G: GnssRisk[] = ["Low", "Moderate", "Moderate", "High", "Severe", "Severe"];

export function gnssRisk(kp: number): GnssRisk | null {
  const g = gLevel(kp);

  return g === null ? null : RISK_BY_G[g];
}

export const GNSS_ADVICE: Record<GnssRisk, string> = {
  Low: "No storm-related impact expected.",
  Moderate: "Accuracy may dip a little. Keep an eye on this page before precision work.",
  High: "RTK and GPS accuracy may be degraded. Consider rescheduling precision work.",
  Severe: "Accuracy may be badly degraded. Reschedule precision work if you can.",
};
