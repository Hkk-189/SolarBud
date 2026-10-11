import { nowMs } from "@/lib/forecast-age";
import { statusSummary } from "@/lib/status-summary";
import { KpBandChart } from "@/components/charts/kp-band-chart";
import { SolarWindCharts } from "@/components/charts/solar-wind-charts";
import { KpForecastCard } from "@/components/cards/kp-forecast-card";
import { SolarWindCard } from "@/components/cards/solar-wind-card";
import { StormLevelCard } from "@/components/cards/storm-level-card";
import { getAlertCurrent, getKpForecast, getKpObserved, getSolarWindLatest, getSolarWindWindow } from "@/lib/api/client";

export default async function Home() {
  const [kp, alert, wind, history, observed] = await Promise.all([
    getKpForecast(),
    getAlertCurrent(),
    getSolarWindLatest(),
    getSolarWindWindow(24),
    getKpObserved(24),
  ]);

  const now = nowMs();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Space weather now</h1>
        <p role="status" className="text-base">
          {statusSummary(kp, alert, now)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StormLevelCard result={kp} alert={alert} nowMs={now} />
        <KpForecastCard result={kp} />
        <SolarWindCard result={wind} />
      </div>
      <KpBandChart initial={kp.ok ? kp.data : null} initialObserved={observed.ok ? observed.data : null} />
      <SolarWindCharts initial={history.ok ? history.data : null} />
    </div>
  );
}
