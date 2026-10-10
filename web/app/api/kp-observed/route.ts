import { getKpObserved } from "@/lib/api/client";

/** Same-origin proxy for the browser chart, like /api/kp-forecast. */
export async function GET() {
  const r = await getKpObserved(24);

  return r.ok ? Response.json(r.data) : Response.json({ error: "unavailable" }, { status: 503 });
}
