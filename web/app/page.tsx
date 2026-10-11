import { nowMs } from "@/lib/forecast-age";
import { KpBandChart } from "@/components/charts/kp-band-chart";
import { SolarWindCharts } from "@/components/charts/solar-wind-charts";
import { KpForecastCard } from "@/components/cards/kp-forecast-card";
import { SolarWindCard } from "@/components/cards/solar-wind-card";
import { StormHero } from "@/components/home/storm-hero";
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
    <div className="space-y-8">
      <StormHero forecast={kp} alert={alert} observed={observed} nowMs={now} />
      <div className="grid items-start gap-4 md:grid-cols-[2fr_1fr]">
        <KpBandChart initial={kp.ok ? kp.data : null} initialObserved={observed.ok ? observed.data : null} />
        <div className="space-y-4">
          <KpForecastCard result={kp} />
          <SolarWindCard result={wind} />
        </div>
      </div>
      <SolarWindCharts initial={history.ok ? history.data : null} />
    </div>
  );
}
