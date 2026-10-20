import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAlertCurrent,
  getKpForecast,
  getKpObserved,
  getSolarWindLatest,
  getSolarWindWindow,
  proxy,
} from "@/lib/api/client";

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

describe("alert current", () => {
  it("hits /v1/alerts/current", async () => {
    const f = vi.fn<typeof fetch>(() => json({ ok: 1 }));
    vi.stubGlobal("fetch", f);
    await getAlertCurrent();
    expect(f.mock.calls[0]![0]).toBe("http://localhost:8000/v1/alerts/current");
  });

  it("returns ok:false on 503", async () => {
    vi.stubGlobal("fetch", () => json({ detail: "x" }, 503));
    expect(await getAlertCurrent()).toEqual({ ok: false });
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

  it("asks for 3 h more Kp history so the bin straddling the window start is included", async () => {
    const f = vi.fn<typeof fetch>(() => Promise.resolve(Response.json([])));
    vi.stubGlobal("fetch", f);
    await getKpObserved(24);
    const u = new URL(String(f.mock.calls[0]![0]));
    expect(u.pathname).toBe("/v1/kp");
    const span = Date.parse(u.searchParams.get("end")!) - Date.parse(u.searchParams.get("start")!);
    expect(span).toBe(27 * 3600 * 1000);
  });
});

describe("proxy", () => {
  it("answers 200 with the data when the API result is ok", async () => {
    const res = await proxy(() => Promise.resolve({ ok: true, data: { a: 1 } } as const))();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1 });
  });
  it("answers 503 with an error body when it is not, so the browser never sees the API origin", async () => {
    const res = await proxy(() => Promise.resolve({ ok: false } as const))();

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });
});
