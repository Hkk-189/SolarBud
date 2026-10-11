import type { KpForecast, KpPoint } from "@/lib/api/client";
import { forecastIsOld } from "@/lib/forecast-age";
import { formatUtc } from "@/lib/format";
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
  { h: 1, label: "In 1 h", spoken: "In 1 hour", afterLabel: "+1 h", afterSpoken: "1 hour after the forecast" },
  { h: 3, label: "In 3 h", spoken: "In 3 hours", afterLabel: "+3 h", afterSpoken: "3 hours after the forecast" },
  { h: 6, label: "In 6 h", spoken: "In 6 hours", afterLabel: "+6 h", afterSpoken: "6 hours after the forecast" },
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
  // Lanes are relative to the issue time, so an old forecast says so instead of promising "In 1 h".
  const old = forecast ? forecastIsOld(forecast.issued_at, nowMs) : false;

  for (const { h, label: fresh, spoken: freshSpoken, afterLabel, afterSpoken } of HORIZONS) {
    const label = old ? afterLabel : fresh;
    const spoken = old ? afterSpoken : freshSpoken;
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

  const issuedNote =
    forecast && old ? `Forecast issued ${formatUtc(forecast.issued_at)}, so these lanes count from then.` : null;

  return { bands, lanes, issuedNote };
}
