import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StormHero } from "@/components/home/storm-hero";
import { EXPLAIN } from "@/lib/explanations";
import { statusSummary } from "@/lib/status-summary";
import type { components } from "@/lib/api/schema";

afterEach(cleanup);

type Kp = components["schemas"]["KpForecast"];

const forecast: Kp = {
  issued_at: "2026-10-04T12:00:00Z",
  model_version: "lgbm-1",
  data_stale: false,
  horizons: [
    { horizon_h: 1, p10: 4.0, p50: 6.0, p90: 7.33 },
    { horizon_h: 3, p10: 3.0, p50: 4.33, p90: 5.67 },
    { horizon_h: 6, p10: 2.0, p50: 3.0, p90: 4.0 },
  ],
};

const down = { ok: false } as const;

const NOW = Date.parse("2026-10-04T12:05:00Z"); // 5 min after the fixture forecast

describe("StormHero", () => {
  const quiet = { ok: true, data: { level: "none", since: null } } as const;

  it("makes the status sentence the only h1, inside a status region", () => {
    const alert = { ok: true, data: { level: "warning", since: null } } as const;
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={alert} observed={down} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(h1.textContent).toBe(statusSummary({ ok: true, data: forecast }, alert, NOW));
    expect(screen.getByRole("status").contains(h1)).toBe(true);
  });
  it("shows a fresh observation as Now", () => {
    const observed = { ok: true, data: [{ time: "2026-10-04T09:00:00Z", kp: 3.33 }] };
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={quiet} observed={observed} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Now: Kp 3.3");
  });
  it("drops an old observation from Now", () => {
    const observed = { ok: true, data: [{ time: "2026-10-04T03:00:00Z", kp: 3.33 }] };
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={quiet} observed={observed} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Now: no recent observation");
  });
  it("shows the +1 h forecast on the ruler", () => {
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={quiet} observed={down} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("In 1 hour: likely Kp 6.0 (G2)");
  });
  it("explains itself in plain language", () => {
    const { container } = render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={quiet} observed={down} />);
    expect(within(container).getByText(EXPLAIN.stormLevel.summary)).toBeTruthy();
  });
  it("makes the h1 the no-forecast sentence and the ruler lanes say no forecast when the API is down", () => {
    render(<StormHero nowMs={NOW} forecast={down} alert={down} observed={down} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "We can't reach a current forecast, so we can't say whether a storm is coming.",
    );
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("In 1 hour: no forecast");
    expect(screen.getAllByText("no forecast")).toHaveLength(3);
  });
  it.each([
    ["warning", "Warning"],
    ["active", "Active"],
    ["all_clear", "All clear"],
    ["none", "No active alert"],
    ["watch", "Watch"],
  ])("writes out alert level %s as %s", (level, text) => {
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={{ ok: true, data: { level, since: null } }} observed={down} />);
    expect(screen.getByText(text)).toBeTruthy();
  });
  it("shows since in UTC", () => {
    const data = { level: "warning", since: "2026-10-10T05:05:00Z" };
    render(<StormHero nowMs={NOW} forecast={down} alert={{ ok: true, data }} observed={down} />);
    expect(screen.getByText("Since 2026-10-10 05:05 UTC")).toBeTruthy();
  });
  it.each([
    ["none", /no active alert/i],
    ["all_clear", /^all clear/i],
  ])("qualifies %s when the forecast is over 15 minutes old", (level, text) => {
    const later = Date.parse("2026-10-04T12:20:01Z");
    render(
      <StormHero nowMs={later} forecast={{ ok: true, data: forecast }} alert={{ ok: true, data: { level, since: null } }} observed={down} />,
    );
    expect(screen.getByText(text).textContent).toMatch(/15 min/i);
  });
  it("keeps a plain label at exactly 15 minutes", () => {
    const edge = Date.parse("2026-10-04T12:15:00Z");
    render(<StormHero nowMs={edge} forecast={{ ok: true, data: forecast }} alert={quiet} observed={down} />);
    expect(screen.getByText("No active alert")).toBeTruthy();
  });
  it("does not hide a warning behind the age caveat", () => {
    const later = Date.parse("2026-10-04T13:00:00Z");
    const warning = { ok: true, data: { level: "warning", since: null } } as const;
    render(<StormHero nowMs={later} forecast={{ ok: true, data: forecast }} alert={warning} observed={down} />);
    expect(screen.getByText("Warning")).toBeTruthy();
  });
  it("flags a stale forecast next to no active alert", () => {
    const stale = { ok: true, data: { ...forecast, data_stale: true } } as const;
    render(<StormHero nowMs={NOW} forecast={stale} alert={quiet} observed={down} />);
    expect(screen.getByText(/no active alert/i).textContent).toMatch(/stale/i);
  });
  it("shows plain no active alert for a fresh forecast", () => {
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={quiet} observed={down} />);
    expect(screen.getByText("No active alert")).toBeTruthy();
    expect(screen.queryByText(/stale/i)).toBeNull();
  });
  it("never reads a missing forecast as a plain no active alert", () => {
    render(<StormHero nowMs={NOW} forecast={down} alert={quiet} observed={down} />);
    expect(screen.queryByText("No active alert")).toBeNull();
    expect(screen.getByText(/no active alert reported/i).textContent).toMatch(/no current forecast/i);
  });
  it.each([
    ["stale", { ok: true, data: { ...forecast, data_stale: true } } as const, /stale/i],
    ["missing", down, /no current forecast/i],
  ])("qualifies all clear when the forecast is %s", (_name, result, caveat) => {
    const clear = { ok: true, data: { level: "all_clear", since: null } } as const;
    render(<StormHero nowMs={NOW} forecast={result} alert={clear} observed={down} />);
    expect(screen.queryByText("All clear")).toBeNull();
    expect(screen.getByText(/^all clear/i).textContent).toMatch(caveat);
  });
  it("shows the ruler and Warning together for a live forecast", () => {
    const warn = { ok: true, data: { level: "warning", since: null } } as const;
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={warn} observed={down} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("In 1 hour: likely Kp 6.0 (G2)");
    expect(screen.getByText("Warning")).toBeTruthy();
  });
  it("says alert status is unavailable, never no alert, and keeps the ruler", () => {
    render(<StormHero nowMs={NOW} forecast={{ ok: true, data: forecast }} alert={down} observed={down} />);
    expect(screen.getByText("Alert status unavailable")).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("In 1 hour: likely Kp 6.0 (G2)");
    expect(screen.queryByText("No active alert")).toBeNull();
  });
});

