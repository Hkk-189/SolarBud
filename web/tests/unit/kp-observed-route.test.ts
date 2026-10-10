import { afterEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/kp-observed/route";

afterEach(() => vi.unstubAllGlobals());

it("proxies the last 24 h (+3 h for the straddling bin) of observed Kp", async () => {
  const f = vi.fn<typeof fetch>(() => Promise.resolve(Response.json([{ time: "2024-05-10T18:00:00Z", kp: 4 }])));
  vi.stubGlobal("fetch", f);
  const res = await GET();
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([{ time: "2024-05-10T18:00:00Z", kp: 4 }]);
  const url = new URL(String(f.mock.calls[0]![0]));
  expect(url.pathname).toBe("/v1/kp");
  const span = Date.parse(url.searchParams.get("end")!) - Date.parse(url.searchParams.get("start")!);
  expect(span).toBe(27 * 3600 * 1000);
});

it("answers 503 when the API is down", async () => {
  vi.stubGlobal("fetch", () => Promise.reject(new TypeError("fetch failed")));
  expect((await GET()).status).toBe(503);
});
