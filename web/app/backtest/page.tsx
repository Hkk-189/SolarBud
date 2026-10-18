import type { Metadata } from "next";
import { StormTimeline, TimelineLegend } from "@/components/backtest/storm-timeline";
import { BACKTESTS, KIND_LABEL } from "@/lib/backtests";
import { formatUtc } from "@/lib/format";

export const metadata: Metadata = { title: "Backtests" };

export default function Backtest() {
  return (
    <div className="space-y-6">
      <header className="max-w-prose space-y-2">
        <h1 className="text-2xl font-bold">Backtests</h1>
        <p className="text-base">
          We replayed five major storms through the alert engine, hour by hour, using only data available at the time.
          The model never saw these storms in training, and the alert settings were chosen on other years.
        </p>
        <TimelineLegend />
      </header>
      {BACKTESTS.map((s) => (
        <section key={s.id} className="rounded-card border border-outline bg-card p-6">
          <h2 className="text-[0.95rem] font-semibold">{s.name}</h2>
          <p className="mt-1 text-sm text-muted">
            Storm dates {s.start} to {s.end}. {s.falseWarnings} false {s.falseWarnings === 1 ? "warning" : "warnings"}.
          </p>
          <div className="mt-4 overflow-x-auto">
            <StormTimeline storm={s} />
          </div>
          <details className="mt-3 text-sm">
            <summary className="w-fit cursor-pointer font-semibold text-muted">All {s.events.length} events</summary>
            <table className="mt-2 w-full max-w-md text-left tabular-nums">
              <thead>
                <tr className="bg-primary/5 text-xs font-semibold text-primary-fill-hover">
                  <th className="h-10 px-2">Time</th>
                  <th className="px-2">Event</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {s.events.map((e) => (
                  <tr key={`${e.kind}${e.at}`} className="border-t border-outline">
                    <td className="p-2">{formatUtc(e.at)}</td>
                    <td className="p-2">{KIND_LABEL[e.kind]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
      ))}
    </div>
  );
}
