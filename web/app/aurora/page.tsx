import type { Metadata } from "next";
import { AuroraView } from "@/components/forecast/aurora-gnss";
import { getKpForecast } from "@/lib/api/client";

export const metadata: Metadata = { title: "Aurora" };

export default async function Aurora() {
  const result = await getKpForecast();

  return <AuroraView initial={result.ok ? result.data : null} />;
}
