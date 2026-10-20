"use client";

import { Card, Empty } from "@/components/cards/card";
import { useState } from "react";
import { useLive } from "@/components/charts/use-live";
import { useNow } from "@/components/charts/use-now";
import { AuroraMap } from "@/components/forecast/aurora-map";
import { MyLocation } from "@/components/forecast/my-location";
import type { KpForecast } from "@/lib/api/client";
import type { Place } from "@/lib/places";
import { GNSS_ADVICE, gnssRisk, reachLabel } from "@/lib/aurora-gnss";
import { EXPLAIN } from "@/lib/explanations";
import { forecastIsOld } from "@/lib/forecast-age";
import { formatNum, formatUtc } from "@/lib/format";

const HEAD = "py-1 pr-2 text-left text-xs font-semibold text-muted";

type Props = { initial: KpForecast | null };

function Notice({ data, nowMs }: { data: KpForecast; nowMs: number }) {
  const old = forecastIsOld(data.issued_at, nowMs);

  if (!old && !data.data_stale) return null;

  return (
    <p role="status" className="mb-3 rounded-md border border-outline bg-surface-soft px-3 py-2 text-sm font-semibold">
      {old
        ? "This forecast is older than 15 minutes, so it may be out of date."
        : "L1 solar wind data is out of date, treat this forecast with caution."}
    </p>
  );
}

function Page({ title, intro, initial, children }: Props & { title: string; intro: string; children: (d: KpForecast) => React.ReactNode }) {
  const { data, isError, updatedAt } = useLive<KpForecast>("kp-forecast", "/api/kp-forecast", initial);
  const nowMs = useNow();

  return (
    <div className="space-y-6">
      <header className="max-w-prose space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-base">{intro}</p>
      </header>
      {data ? (
        <>
          <Notice data={data} nowMs={nowMs} />
          {children(data)}
          <p className="text-xs tabular-nums text-muted">
            Issued {formatUtc(data.issued_at)}. Model {data.model_version}.
            {nowMs > 0 && ` Refreshed ${formatUtc(new Date(updatedAt).toISOString())}.`}
          </p>
        </>
      ) : (
        <Card title="Forecast">
          <Empty>
            {isError
              ? "Forecast unavailable. The API is not reachable or has not issued a forecast yet."
              : "Loading forecast…"}
          </Empty>
        </Card>
      )}
    </div>
  );
}

function AuroraBody({ d }: { d: KpForecast }) {
  const [place, setPlace] = useState<Place | null>(null);
  const likelyKp = Math.max(...d.horizons.map((h) => h.p50));
  const highKp = Math.max(...d.horizons.map((h) => h.p90));

  return (
    <Card title="Where the aurora may reach" explain={EXPLAIN.aurora}>
      <p className="mb-3 text-sm text-muted">The map shows the highest value forecast over the next 6 hours.</p>
      <AuroraMap likelyKp={likelyKp} highKp={highKp} marker={place} />
      <MyLocation likelyKp={likelyKp} highKp={highKp} onChange={setPlace} />
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr>
            <th className={HEAD}>Ahead</th>
            <th className={HEAD}>Likely Kp</th>
            <th className={HEAD}>Visible down to</th>
            <th className={HEAD}>Could reach (high)</th>
          </tr>
        </thead>
        <tbody>
          {d.horizons.map((h) => (
            <tr key={h.horizon_h} className="border-t border-outline">
              <th scope="row" className="py-2 pr-2 text-left font-medium">
                +{h.horizon_h} h
              </th>
              <td className="py-2 pr-2 tabular-nums">{formatNum(h.p50, 1)}</td>
              <td className="py-2 pr-2">{reachLabel(h.p50)}</td>
              <td className="py-2">{reachLabel(h.p90)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-muted">
        From India the aurora is visible only in extreme storms, such as the one seen from Ladakh in May 2024.
      </p>
    </Card>
  );
}

export function AuroraView({ initial }: Props) {
  return (
    <Page
      title="Aurora"
      intro="How far towards the equator the aurora may be visible, from the Kp forecast. Latitudes are geomagnetic, which differs from the latitude on a map."
      initial={initial}
    >
      {(d) => <AuroraBody d={d} />}
    </Page>
  );
}

export function GnssView({ initial }: Props) {
  return (
    <Page
      title="GNSS"
      intro="How likely a geomagnetic storm is to degrade GPS and RTK accuracy, from the forecast storm level."
      initial={initial}
    >
      {(d) => (
        <Card title="GNSS risk" explain={EXPLAIN.gnss}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={HEAD}>Ahead</th>
                <th className={HEAD}>Risk</th>
                <th className={HEAD}>Could reach (high)</th>
                <th className={HEAD}>What to do</th>
              </tr>
            </thead>
            <tbody>
              {d.horizons.map((h) => {
                const likely = gnssRisk(h.p50);

                return (
                  <tr key={h.horizon_h} className="border-t border-outline align-top">
                    <th scope="row" className="py-2 pr-2 text-left font-medium">
                      +{h.horizon_h} h
                    </th>
                    <td className="py-2 pr-2 font-semibold">{likely ?? "No data"}</td>
                    <td className="py-2 pr-2">{gnssRisk(h.p90) ?? "No data"}</td>
                    <td className="py-2 text-muted">{likely ? GNSS_ADVICE[likely] : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">
            This covers the next 6 hours only. It does not include the evening scintillation near the equator that
            matters in India, which depends on local time, not only Kp.
          </p>
        </Card>
      )}
    </Page>
  );
}
