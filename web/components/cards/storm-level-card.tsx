import { Card } from "./card";
import { GLevelBadge } from "./g-level-badge";
import { AlertLevel } from "./alert-level";
import type { AlertStatus, ApiResult, KpForecast } from "@/lib/api/client";

export function StormLevelCard({
  result,
  alert,
}: {
  result: ApiResult<KpForecast>;
  alert: ApiResult<AlertStatus>;
}) {
  const h1 = result.ok ? result.data.horizons.find((h) => h.horizon_h === 1) : undefined;

  const caveat = !result.ok
    ? "no current forecast, cannot confirm"
    : result.data.data_stale
      ? "data stale, alerts may be suppressed"
      : null;

  return (
    <Card title="Storm level">
      <GLevelBadge kp={h1 ? h1.p50 : Number.NaN} />
      <p className="mt-3 text-sm text-muted">
        {h1 ? "Forecast, +1 h (median Kp)" : "No forecast available"}
      </p>
      <AlertLevel result={alert} caveat={caveat} />
    </Card>
  );
}
