import { afterEach, describe, expect, it, vi } from "vitest";
import { getKpForecast, getSolarWindLatest } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe("api client", () => {
  it("returns data on 200 from the default base URL", async () => {
    const f = vi.fn<typeof fetch>(() => json({ ok: 1 }));
    vi.stubGlobal("fetch", f);
    const r = await getKpForecast();
    expect(r).toEqual({ ok: true, data: { ok: 1 } });
    expect(f.mock.calls[0]![0]).toBe("http://localhost:8000/v1/forecast/kp");
  });

  it("returns ok:false on 503", async () => {
    vi.stubGlobal("fetch", () => json({ detail: "x" }, 503));
    expect(await getSolarWindLatest()).toEqual({ ok: false });
  });

  it("never throws when the network fails", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("fetch failed")));
    expect(await getSolarWindLatest()).toEqual({ ok: false });
  });
});
