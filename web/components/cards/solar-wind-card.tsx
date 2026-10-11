import { Card, Empty } from "./card";
import type { ApiResult, SolarWindPoint } from "@/lib/api/client";
import { EXPLAIN } from "@/lib/explanations";
import { formatNum, formatUtc } from "@/lib/format";

export function SolarWindCard({ result }: { result: ApiResult<SolarWindPoint> }) {
  const title = "Solar wind (L1)";

  if (!result.ok) {
    return (
      <Card title={title} explain={EXPLAIN.solarWindNow}>
        <Empty>Solar wind data unavailable. No recent reading from the API.</Empty>
      </Card>
    );
  }

  const d = result.data;

  const rows: [string, string, number | null | undefined, number][] = [
    ["Speed", "km/s", d.speed_kms, 1],
    ["Density", "cm⁻³", d.density_cm3, 1],
    ["Bz (GSM)", "nT", d.bz_gsm_nt, 1],
    ["Bt", "nT", d.bt_nt, 1],
  ];

  return (
    <Card title={title} explain={EXPLAIN.solarWindNow}>
      <dl className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-2 gap-y-2 text-sm">
        {rows.map(([label, unit, value, digits]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right tabular-nums">{formatNum(value, digits)}</dd>
            <dd className="w-12 text-xs text-muted">{unit}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">
        Measured <span className="tabular-nums">{formatUtc(d.time)}</span>
      </p>
    </Card>
  );
}
