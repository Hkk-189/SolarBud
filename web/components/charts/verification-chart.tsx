"use client";

import { useMemo } from "react";
import { Card, Empty } from "@/components/cards/card";
import { EChart } from "./echart";
import { TimeZoneToggle, useTimeZone } from "./time-zone";
import { useChartColors } from "./use-chart-colors";
import { useLive } from "./use-live";
import type { VerificationPoint } from "@/lib/api/client";
import { verificationOption } from "@/lib/chart-options";
import { EXPLAIN } from "@/lib/explanations";
import { scoreVerification } from "@/lib/verification";

const TITLE = "Last 48 hours: forecast made 3 h ahead vs what happened";

export function VerificationChart({ initial, Chart = EChart }: { initial: VerificationPoint[] | null; Chart?: typeof EChart }) {
  const { utc } = useTimeZone();
  const colors = useChartColors();

  const { data, isError } = useLive<VerificationPoint[]>("verification", "/api/verification", initial);

  const option = useMemo(() => (data ? verificationOption({ points: data, utc, colors }) : {}), [data, utc, colors]);

  if (!data) {
    return (
      <Card title={TITLE}>
        <Empty>{isError ? "Comparison unavailable. The API is not reachable." : "Loading the comparison…"}</Empty>
      </Card>
    );
  }

  const { inside, total } = scoreVerification(data);

  return (
    <Card title={TITLE} explain={EXPLAIN.verification}>
      {data.length === 0 ? (
        <Empty>No forecasts issued in the last 48 hours.</Empty>
      ) : total === 0 ? (
        <Empty>No completed 3-hour periods yet.</Empty>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold tabular-nums">
              {inside} of {total} observed values fell inside the likely range.
            </p>
            <TimeZoneToggle />
          </div>
          <Chart
            option={option}
            label={`Forecasts made 3 hours ahead against the Kp measured afterwards: ${inside} of ${total} measured values fell inside the forecast range.`}
            heightClass="h-64"
          />
        </>
      )}
    </Card>
  );
}
