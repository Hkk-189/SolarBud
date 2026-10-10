import { getKpForecast } from "@/lib/api/client";

/** Same-origin proxy for the browser chart, like /api/solar-wind. */
export async function GET() {
  const r = await getKpForecast();

  return r.ok ? Response.json(r.data) : Response.json({ error: "unavailable" }, { status: 503 });
}
