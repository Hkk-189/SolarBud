import { afterEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/alert-current/route";

afterEach(() => vi.unstubAllGlobals());

it("proxies the current alert status", async () => {
  const f = vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ level: "none", since: null })));
  vi.stubGlobal("fetch", f);
  const res = await GET();
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ level: "none", since: null });
  expect(new URL(String(f.mock.calls[0]![0])).pathname).toBe("/v1/alerts/current");
});

it("answers 503 when the API is down", async () => {
  vi.stubGlobal("fetch", () => Promise.reject(new TypeError("fetch failed")));
  expect((await GET()).status).toBe(503);
});
