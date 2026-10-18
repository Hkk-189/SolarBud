import { getVerification } from "@/lib/api/client";

/** Same-origin proxy for the browser, like /api/kp-forecast. */
export async function GET() {
  const r = await getVerification();

  return r.ok ? Response.json(r.data) : Response.json({ error: "unavailable" }, { status: 503 });
}
