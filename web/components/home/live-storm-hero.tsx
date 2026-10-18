"use client";

import { useAlertCurrent, useKpForecast, useKpObserved } from "@/components/charts/use-kp-forecast";
import { useNow } from "@/components/charts/use-now";
import { StormHero } from "@/components/home/storm-hero";
import type { AlertStatus, ApiResult, KpForecast, KpPoint } from "@/lib/api/client";
import { formatUtc } from "@/lib/format";

const found = <T,>(data: T | undefined): ApiResult<T> => (data === undefined ? { ok: false } : { ok: true, data });

/** The hero, kept current: server data first, then the same refresh the charts use. */
export function LiveStormHero({
  forecast,
  alert,
  observed,
  serverNowMs,
}: {
  forecast: ApiResult<KpForecast>;
  alert: ApiResult<AlertStatus>;
  observed: ApiResult<KpPoint[]>;
  /** The server's clock, used until the browser clock is available so the first paint matches the server render. */
  serverNowMs: number;
}) {
  const kp = useKpForecast(forecast.ok ? forecast.data : null);
  const { data: alertData } = useAlertCurrent(alert.ok ? alert.data : null);
  const { data: observedData } = useKpObserved(observed.ok ? observed.data : null);
  const clock = useNow();

  return (
    <>
      <StormHero
        forecast={found(kp.data)}
        alert={found(alertData)}
        observed={found(observedData)}
        nowMs={clock || serverNowMs}
      />
      {clock > 0 && (
        <p className="mt-3 text-xs tabular-nums text-muted">
          Refreshed {formatUtc(new Date(kp.updatedAt).toISOString())}.
        </p>
      )}
    </>
  );
}
