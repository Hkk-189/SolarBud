import type { Metadata } from "next";
import { GnssView } from "@/components/forecast/aurora-gnss";
import { DemoBanner } from "@/components/shell/demo-banner";
import { demoKpForecast, isDemo, recordedAt } from "@/lib/demo";

export const metadata: Metadata = { title: "GNSS" };

export default async function Gnss() {
  const result = await demoKpForecast();

  return (
    <>
      {isDemo(result) && <DemoBanner at={recordedAt} />}
      <GnssView initial={result.ok ? result.data : null} />
    </>
  );
}
