// Mirrors backend/app/core/constants.py: G_n starts at Kp >= (n + 4) - 1/3 (G1 = 5-), with a
// 1e-3 tolerance because Kp thirds are stored rounded. Keep the two in sync.
const KP_TOL = 1e-3;

export function gLevel(kp: number): number | null {
  if (Number.isNaN(kp)) return null;
  let level = 0;
  for (let n = 1; n <= 5; n++) {
    if (kp >= n + 4 - 1 / 3 - KP_TOL) level = n;
  }
  return level;
}
