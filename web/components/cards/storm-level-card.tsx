import { Card } from "./card";
import { GLevelBadge } from "./g-level-badge";
import type { ApiResult, KpForecast } from "@/lib/api/client";

export function StormLevelCard({ result }: { result: ApiResult<KpForecast> }) {
  const h1 = result.ok ? result.data.horizons.find((h) => h.horizon_h === 1) : undefined;
  return (
    <Card title="Storm level">
      <GLevelBadge kp={h1 ? h1.p50 : Number.NaN} />
      <p className="mt-3 text-sm text-muted">
        {h1 ? "Forecast, +1 h (median Kp)" : "No forecast available"}
      </p>
    </Card>
  );
}
