import { KpForecastCard } from "@/components/cards/kp-forecast-card";
import { SolarWindCard } from "@/components/cards/solar-wind-card";
import { StormLevelCard } from "@/components/cards/storm-level-card";
import { getKpForecast, getSolarWindLatest } from "@/lib/api/client";

export default async function Home() {
  const [kp, wind] = await Promise.all([getKpForecast(), getSolarWindLatest()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Space weather now</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StormLevelCard result={kp} />
        <KpForecastCard result={kp} />
        <SolarWindCard result={wind} />
      </div>
    </div>
  );
}
