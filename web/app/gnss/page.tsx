import type { Metadata } from "next";
import { GnssView } from "@/components/forecast/aurora-gnss";
import { getKpForecast } from "@/lib/api/client";
import { nowMs } from "@/lib/forecast-age";

export const metadata: Metadata = { title: "GNSS" };

export default async function Gnss() {
  return <GnssView result={await getKpForecast()} nowMs={nowMs()} />;
}
