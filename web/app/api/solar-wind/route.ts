import { getSolarWindWindow } from "@/lib/api/client";

/** Same-origin proxy for the browser charts: the API origin (a tunnel URL) never reaches the client. */
export async function GET() {
  const r = await getSolarWindWindow(24);

  return r.ok ? Response.json(r.data) : Response.json({ error: "unavailable" }, { status: 503 });
}
