import type { KpForecast, KpPoint } from "@/lib/api/client";
import { gLevel, gStart } from "@/lib/g-level";

export interface RulerLane {
  label: string;
  kind: "observed" | "forecast";
  p50: number | null;
  p10?: number;
  p90?: number;
  text: string;
}

const EDGES = [0, 1, 2, 3, 4, 5].map((n) => (n === 0 ? 0 : gStart(n)));

const KP_MAX = 9;

const HORIZONS = [
  { h: 1, label: "In 1 h", spoken: "In 1 hour" },
  { h: 3, label: "In 3 h", spoken: "In 3 hours" },
  { h: 6, label: "In 6 h", spoken: "In 6 hours" },
];

const clamp = (kp: number) => Math.min(KP_MAX, Math.max(0, kp));

const one = (kp: number) => kp.toFixed(1);

const g = (kp: number) => `G${gLevel(kp) ?? 0}`;

/** Two Kp bins: an older reading is not "Now". */
export const MAX_OBSERVATION_AGE_MS = 6 * 3600 * 1000;

function observedLane(observed: KpPoint[] | null, nowMs: number): RulerLane {
  const last = observed?.findLast((p) => p.kp != null);
  const kp = last?.kp;

  if (!last || kp == null || !Number.isFinite(kp) || nowMs - Date.parse(last.time) > MAX_OBSERVATION_AGE_MS) {
    return { label: "Now", kind: "observed", p50: null, text: "Now: no recent observation" };
  }

  const p50 = clamp(kp);

  return { label: "Now", kind: "observed", p50, text: `Now: Kp ${one(p50)} (${g(p50)})` };
}

export function kpRuler(forecast: KpForecast | null, observed: KpPoint[] | null, nowMs: number) {
  const bands = EDGES.map((from, i) => ({ g: i, from, to: EDGES[i + 1] ?? KP_MAX }));
  const lanes: RulerLane[] = [observedLane(observed, nowMs)];

  for (const { h, label, spoken } of HORIZONS) {
    const hz = forecast?.horizons.find((x) => x.horizon_h === h);

    if (!hz || ![hz.p10, hz.p50, hz.p90].every(Number.isFinite)) {
      lanes.push({ label, kind: "forecast", p50: null, text: `${spoken}: no forecast` });
      continue;
    }

    const [p10, p90] = [clamp(hz.p10), clamp(hz.p90)].sort((a, b) => a - b);
    const p50 = clamp(hz.p50);
    const range = g(p10) === g(p90) ? g(p10) : `${g(p10)} to ${g(p90)}`;

    lanes.push({
      label,
      kind: "forecast",
      p50,
      p10,
      p90,
      text: `${spoken}: likely Kp ${one(p50)} (${g(p50)}), range ${one(p10)} to ${one(p90)} (${range})`,
    });
  }

  return { bands, lanes };
}
