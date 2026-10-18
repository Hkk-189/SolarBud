import type { Metadata } from "next";
import { AuroraView } from "@/components/forecast/aurora-gnss";
import { getKpForecast } from "@/lib/api/client";
import { nowMs } from "@/lib/forecast-age";

export const metadata: Metadata = { title: "Aurora" };

export default async function Aurora() {
  return <AuroraView result={await getKpForecast()} nowMs={nowMs()} />;
}
