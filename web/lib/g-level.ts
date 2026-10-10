// Mirrors backend/app/core/constants.py: G_n starts at Kp >= (n + 4) - 1/3 (G1 = 5-), with a
// 1e-3 tolerance because Kp thirds are stored rounded. Keep the two in sync.
const KP_TOL = 1e-3;

const gStart = (n: number) => n + 4 - 1 / 3;

/** Kp 5- (4.667), where G1 starts: the chart's threshold line. */
export const G1_KP = gStart(1);

export function gLevel(kp: number): number | null {
  if (Number.isNaN(kp)) return null;
  let level = 0;

  for (let n = 1; n <= 5; n++) {
    if (kp >= gStart(n) - KP_TOL) level = n;
  }

  return level;
}
