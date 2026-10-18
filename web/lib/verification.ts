import type { VerificationPoint } from "@/lib/api/client";

export interface VerificationScore {
  inside: number;
  total: number;
}

/** How many observed values fell inside their forecast's p10 to p90 range (edges count). Unobserved bins are not scored. */
export function scoreVerification(points: VerificationPoint[]): VerificationScore {
  const observed = points.flatMap((p) => (p.observed_kp === null || p.observed_kp === undefined ? [] : [{ p, kp: p.observed_kp }]));

  return { inside: observed.filter(({ p, kp }) => kp >= p.p10 && kp <= p.p90).length, total: observed.length };
}
