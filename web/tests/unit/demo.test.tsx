import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DemoBanner } from "@/components/shell/demo-banner";
import { isDemo, orDemo } from "@/lib/demo";

afterEach(cleanup);

it("passes live data through untouched", async () => {
  const live = { ok: true, data: 1 } as const;

  expect(await orDemo(Promise.resolve(live), 2)).toEqual({ ok: true, data: 1 });
});

it("falls back to the recording, marked as such, when the API did not answer", async () => {
  expect(await orDemo(Promise.resolve({ ok: false }), 2)).toEqual({ ok: true, data: 2, demo: true });
});

it("knows a page shows a recording only when some result is one", () => {
  expect(isDemo({ ok: true, data: 1 }, { ok: false })).toBe(false);
  expect(isDemo({ ok: true, data: 1 }, { ok: true, data: 2, demo: true })).toBe(true);
});

it("says which time the recording is from", () => {
  render(<DemoBanner at="2026-11-02T05:14:59Z" />);
  expect(screen.getByRole("status").textContent).toMatch(/recording made 2026-11-02 05:14 UTC/);
});
