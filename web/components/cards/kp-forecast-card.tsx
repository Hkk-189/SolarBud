import { Card, Empty } from "./card";
import { GLevelBadge } from "./g-level-badge";
import type { ApiResult, KpForecast } from "@/lib/api/client";
import { formatNum, formatUtc } from "@/lib/format";

export function KpForecastCard({ result }: { result: ApiResult<KpForecast> }) {
  const title = "Kp forecast (+1, +3, +6 h)";
  if (!result.ok) {
    return (
      <Card title={title}>
        <Empty>Forecast unavailable. The API is not reachable or has not issued a forecast yet.</Empty>
      </Card>
    );
  }
  const { data } = result;
  return (
    <Card title={title}>
      {data.data_stale && (
        <p
          role="status"
          className="mb-3 rounded-md border border-outline bg-surface-soft px-3 py-2 text-sm font-semibold"
        >
          Data stale: L1 solar wind is out of date, treat this forecast with caution.
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted">
            <th className="py-1 pr-2 font-semibold">Ahead</th>
            <th className="py-1 pr-2 font-semibold">p10</th>
            <th className="py-1 pr-2 font-semibold">p50</th>
            <th className="py-1 pr-2 font-semibold">p90</th>
            <th className="py-1 font-semibold">Level</th>
          </tr>
        </thead>
        <tbody>
          {data.horizons.map((h) => (
            <tr key={h.horizon_h} className="border-t border-outline">
              <th scope="row" className="py-2 pr-2 text-left font-medium">
                +{h.horizon_h} h
              </th>
              <td className="py-2 pr-2 font-mono">{formatNum(h.p10, 1)}</td>
              <td className="py-2 pr-2 font-mono">{formatNum(h.p50, 1)}</td>
              <td className="py-2 pr-2 font-mono">{formatNum(h.p90, 1)}</td>
              <td className="py-2">
                <GLevelBadge kp={h.p50} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        Issued <span className="font-mono">{formatUtc(data.issued_at)}</span> · model{" "}
        <span className="font-mono">{data.model_version}</span>
      </p>
    </Card>
  );
}
