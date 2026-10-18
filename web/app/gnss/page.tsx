import type { Metadata } from "next";
import { GnssView } from "@/components/forecast/aurora-gnss";
import { getKpForecast } from "@/lib/api/client";

export const metadata: Metadata = { title: "GNSS" };

export default async function Gnss() {
  const result = await getKpForecast();

  return <GnssView initial={result.ok ? result.data : null} />;
}
