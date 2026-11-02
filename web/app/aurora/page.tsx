import type { Metadata } from "next";
import { AuroraView } from "@/components/forecast/aurora-gnss";
import { DemoBanner } from "@/components/shell/demo-banner";
import { demoKpForecast, isDemo, recordedAt } from "@/lib/demo";

export const metadata: Metadata = { title: "Aurora" };

export default async function Aurora() {
  const result = await demoKpForecast();

  return (
    <>
      {isDemo(result) && <DemoBanner at={recordedAt} />}
      <AuroraView initial={result.ok ? result.data : null} />
    </>
  );
}
