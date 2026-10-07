import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KpForecastCard } from "@/components/cards/kp-forecast-card";
import { SolarWindCard } from "@/components/cards/solar-wind-card";
import { StormLevelCard } from "@/components/cards/storm-level-card";
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

describe("StormLevelCard", () => {
  it("shows the +1 h p50 level labelled as forecast", () => {
    render(<StormLevelCard result={{ ok: true, data: forecast }} />);
    expect(screen.getByText("G2")).toBeTruthy();
    expect(screen.getByText(/forecast, \+1 h/i)).toBeTruthy();
  });
  it("shows No data when the API is down", () => {
    render(<StormLevelCard result={down} />);
    expect(screen.getByText("No data")).toBeTruthy();
  });
});

describe("KpForecastCard", () => {
  it("renders a row per horizon with quantiles and issued_at in UTC", () => {
    render(<KpForecastCard result={{ ok: true, data: forecast }} />);
    expect(screen.getAllByRole("row")).toHaveLength(4);
    const row = screen.getByRole("row", { name: /\+1 h/ });
    expect(within(row).getByText("6.0")).toBeTruthy();
    expect(within(row).getByText("G2")).toBeTruthy();
    expect(screen.getByText(/2026-10-04 12:00 UTC/)).toBeTruthy();
    expect(screen.queryByText(/data stale/i)).toBeNull();
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
  it("shows dashes for missing fields", () => {
    render(<SolarWindCard result={{ ok: true, data: { time: wind.time } }} />);
    expect(screen.getAllByText("—")).toHaveLength(4);
  });
  it("shows an empty state", () => {
    render(<SolarWindCard result={down} />);
    expect(screen.getByText(/solar wind data unavailable/i)).toBeTruthy();
  });
});
