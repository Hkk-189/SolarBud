import { getSolarWindWindow, proxy } from "@/lib/api/client";

/** Same-origin proxy for the browser: the API origin (a tunnel URL) never reaches the client. */
export const GET = proxy(() => getSolarWindWindow(24));
