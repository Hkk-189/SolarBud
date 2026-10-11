import { AlertLevel } from "@/components/cards/alert-level";
import { Explainer } from "@/components/cards/explainer";
import { StormRuler } from "@/components/home/storm-ruler";
import type { AlertStatus, ApiResult, KpForecast, KpPoint } from "@/lib/api/client";
import { alertCaveat } from "@/lib/alert-caveat";
import { EXPLAIN } from "@/lib/explanations";
import { statusSummary } from "@/lib/status-summary";

export function StormHero({
  forecast,
  alert,
  observed,
  nowMs,
}: {
  forecast: ApiResult<KpForecast>;
  alert: ApiResult<AlertStatus>;
  observed: ApiResult<KpPoint[]>;
  /** Current time, passed in so the hero stays pure and testable. */
  nowMs: number;
}) {
  return (
    <section className="space-y-6">
      <div>
        <div role="status">
          <h1 className="max-w-[24ch] text-[clamp(1.6rem,1rem+2.4vw,2.6rem)] font-[650] leading-[1.15] [font-stretch:112%]">
            {statusSummary(forecast, alert, nowMs)}
          </h1>
          <AlertLevel result={alert} caveat={alertCaveat(forecast, nowMs)} />
        </div>
        <Explainer explain={EXPLAIN.stormLevel} />
      </div>
      <StormRuler forecast={forecast.ok ? forecast.data : null} observed={observed.ok ? observed.data : null} />
    </section>
  );
}
