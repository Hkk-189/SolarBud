import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KpForecastCard } from "@/components/cards/kp-forecast-card";
import { SolarWindCard } from "@/components/cards/solar-wind-card";
import { StormLevelCard } from "@/components/cards/storm-level-card";
import { EXPLAIN } from "@/lib/explanations";
import type { components } from "@/lib/api/schema";

afterEach(cleanup);

type Kp = components["schemas"]["KpForecast"];

type Wind = components["schemas"]["SolarWindPoint"];

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

const wind: Wind = {
  time: "2026-10-04T11:58:00Z",
  speed_kms: 512.34,
  density_cm3: 7.8,
  bz_gsm_nt: -9.25,
  bt_nt: 12.1,
};

const down = { ok: false } as const;

const NOW = Date.parse("2026-10-04T12:05:00Z"); // 5 min after the fixture forecast

describe("StormLevelCard", () => {
  const quiet = { ok: true, data: { level: "none", since: null } } as const;

  it("shows the +1 h p50 level labelled as forecast", () => {
    render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={quiet} />);
    expect(screen.getByText("G2")).toBeTruthy();
    expect(screen.getByText(/forecast, \+1 h/i)).toBeTruthy();
  });
  it("explains itself in plain language", () => {
    const { container } = render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={quiet} />);
    expect(within(container).getByText(EXPLAIN.stormLevel.summary)).toBeTruthy();
  });
  it("shows No data when the API is down", () => {
    render(<StormLevelCard nowMs={NOW} result={down} alert={down} />);
    expect(screen.getByText("No data")).toBeTruthy();
  });
  it.each([
    ["warning", "Warning"],
    ["active", "Active"],
    ["all_clear", "All clear"],
    ["none", "No active alert"],
    ["watch", "Watch"],
  ])("writes out alert level %s as %s", (level, text) => {
    render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={{ ok: true, data: { level, since: null } }} />);
    expect(screen.getByText(text)).toBeTruthy();
  });
  it("shows since in UTC", () => {
    const data = { level: "warning", since: "2026-10-10T05:05:00Z" };
    render(<StormLevelCard nowMs={NOW} result={down} alert={{ ok: true, data }} />);
    expect(screen.getByText("Since 2026-10-10 05:05 UTC")).toBeTruthy();
  });
  it.each([
    ["none", /no active alert/i],
    ["all_clear", /^all clear/i],
  ])("qualifies %s when the forecast is over 15 minutes old", (level, text) => {
    const later = Date.parse("2026-10-04T12:20:01Z");
    render(
      <StormLevelCard nowMs={later} result={{ ok: true, data: forecast }} alert={{ ok: true, data: { level, since: null } }} />,
    );
    expect(screen.getByText(text).textContent).toMatch(/15 min/i);
  });
  it("keeps a plain label at exactly 15 minutes", () => {
    const edge = Date.parse("2026-10-04T12:15:00Z");
    render(<StormLevelCard nowMs={edge} result={{ ok: true, data: forecast }} alert={quiet} />);
    expect(screen.getByText("No active alert")).toBeTruthy();
  });
  it("does not hide a warning behind the age caveat", () => {
    const later = Date.parse("2026-10-04T13:00:00Z");
    const warning = { ok: true, data: { level: "warning", since: null } } as const;
    render(<StormLevelCard nowMs={later} result={{ ok: true, data: forecast }} alert={warning} />);
    expect(screen.getByText("Warning")).toBeTruthy();
  });
  it("flags a stale forecast next to no active alert", () => {
    const stale = { ok: true, data: { ...forecast, data_stale: true } } as const;
    render(<StormLevelCard nowMs={NOW} result={stale} alert={quiet} />);
    expect(screen.getByText(/no active alert/i).textContent).toMatch(/stale/i);
  });
  it("shows plain no active alert for a fresh forecast", () => {
    render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={quiet} />);
    expect(screen.getByText("No active alert")).toBeTruthy();
    expect(screen.queryByText(/stale/i)).toBeNull();
  });
  it("never reads a missing forecast as a plain no active alert", () => {
    render(<StormLevelCard nowMs={NOW} result={down} alert={quiet} />);
    expect(screen.queryByText("No active alert")).toBeNull();
    expect(screen.getByText(/no active alert reported/i).textContent).toMatch(/no current forecast/i);
  });
  it.each([
    ["stale", { ok: true, data: { ...forecast, data_stale: true } } as const, /stale/i],
    ["missing", down, /no current forecast/i],
  ])("qualifies all clear when the forecast is %s", (_name, result, caveat) => {
    const clear = { ok: true, data: { level: "all_clear", since: null } } as const;
    render(<StormLevelCard nowMs={NOW} result={result} alert={clear} />);
    expect(screen.queryByText("All clear")).toBeNull();
    expect(screen.getByText(/^all clear/i).textContent).toMatch(caveat);
  });
  it("shows the G badge and Warning together for a live forecast", () => {
    const warn = { ok: true, data: { level: "warning", since: null } } as const;
    render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={warn} />);
    expect(screen.getByText("G2")).toBeTruthy();
    expect(screen.getByText("Warning")).toBeTruthy();
  });
  it("says alert status is unavailable, never no alert, and keeps the G badge", () => {
    render(<StormLevelCard nowMs={NOW} result={{ ok: true, data: forecast }} alert={down} />);
    expect(screen.getByText("Alert status unavailable")).toBeTruthy();
    expect(screen.getByText("G2")).toBeTruthy();
    expect(screen.queryByText("No active alert")).toBeNull();
  });
});

describe("KpForecastCard", () => {
  it("uses a sentence-case card title", () => {
    render(<KpForecastCard result={{ ok: true, data: forecast }} />);
    expect(screen.getByRole("heading", { level: 2 }).className).not.toContain("uppercase");
  });
  it("shows issue time and model on separate lines", () => {
    const { container } = render(<KpForecastCard result={{ ok: true, data: forecast }} />);
    expect(screen.getByText("Issued 2026-10-04 12:00 UTC")).toBeTruthy();
    expect(screen.getByText("Model lgbm-1")).toBeTruthy();
    expect(container.textContent).not.toContain("·");
  });
  it("renders a row per horizon with quantiles and issued_at in UTC", () => {
    render(<KpForecastCard result={{ ok: true, data: forecast }} />);
    expect(screen.getAllByRole("row")).toHaveLength(4);
    const row = screen.getByRole("row", { name: /\+1 h/ });
    expect(within(row).getByText("6.0")).toBeTruthy();
    expect(within(row).getByText("G2")).toBeTruthy();
    expect(screen.getByText(/2026-10-04 12:00 UTC/)).toBeTruthy();
    expect(screen.queryByText(/data stale/i)).toBeNull();
  });
  it("explains itself and uses plain column names with the quantile kept for assistive tech", () => {
    const { container } = render(<KpForecastCard result={{ ok: true, data: forecast }} />);
    const view = within(container);
    expect(view.getByText(EXPLAIN.kpForecast.summary)).toBeTruthy();

    for (const [name, p] of [["Low", "p10"], ["Likely", "p50"], ["High", "p90"]]) {
      const th = view.getByRole("columnheader", { name: `${name} (${p})` });
      expect(th.getAttribute("title")).toBe(p);
      expect(within(th).getByText(`(${p})`).className).toContain("sr-only");
    }
  });
  it("shows a stale notice", () => {
    render(<KpForecastCard result={{ ok: true, data: { ...forecast, data_stale: true } }} />);
    expect(screen.getByRole("status").textContent).toMatch(/data stale/i);
  });
  it("shows an honest empty state", () => {
    render(<KpForecastCard result={down} />);
    expect(screen.getByText(/forecast unavailable/i)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("SolarWindCard", () => {
  it("renders values with units and UTC time", () => {
    render(<SolarWindCard result={{ ok: true, data: wind }} />);
    expect(screen.getByText("512.3")).toBeTruthy();
    expect(screen.getByText("km/s")).toBeTruthy();
    expect(screen.getByText("-9.3")).toBeTruthy();
    expect(screen.getByText(/2026-10-04 11:58 UTC/)).toBeTruthy();
  });
  it("explains itself in plain language", () => {
    const { container } = render(<SolarWindCard result={{ ok: true, data: wind }} />);
    expect(within(container).getByText(EXPLAIN.solarWindNow.summary)).toBeTruthy();
  });
  it("shows dashes for missing fields", () => {
    render(<SolarWindCard result={{ ok: true, data: { time: wind.time } }} />);
    expect(screen.getAllByText("—")).toHaveLength(4);
  });
  it("shows an empty state", () => {
    render(<SolarWindCard result={down} />);
    expect(screen.getByText(/solar wind data unavailable/i)).toBeTruthy();
  });
});
