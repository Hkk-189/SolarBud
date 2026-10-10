import { afterEach, describe, expect, it, vi } from "vitest";
import { getKpForecast, getSolarWindLatest, getSolarWindWindow } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

type Body = { ok: number } | { detail: string };

const json = (body: Body, status = 200) =>
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

describe("solar wind window", () => {
  it("asks for exactly the requested number of hours", async () => {
    const f = vi.fn<typeof fetch>(() => Promise.resolve(Response.json([])));
    vi.stubGlobal("fetch", f);
    await getSolarWindWindow(24);
    const u = new URL(String(f.mock.calls[0]![0]));
    const span = Date.parse(u.searchParams.get("end")!) - Date.parse(u.searchParams.get("start")!);
    expect(span).toBe(24 * 3600 * 1000);
  });
});
