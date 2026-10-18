import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuroraView, GnssView } from "@/components/forecast/aurora-gnss";
import type { KpForecast } from "@/lib/api/client";

const forecast: KpForecast = {
  data_stale: false,
  issued_at: "2026-10-11T00:00:00Z",
  model_version: "t",
  horizons: [
    { horizon_h: 1, p10: 3.0, p50: 5.0, p90: 7.0 },
    { horizon_h: 3, p10: 2.0, p50: 2.3, p90: 4.0 },
    { horizon_h: 6, p10: 5.0, p50: 7.0, p90: 8.0 },
  ],
};

const wrap = (ui: React.ReactNode) => <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>;

const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

const at = (iso: string) => vi.setSystemTime(new Date(iso));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => media); // jsdom has no matchMedia
  vi.useFakeTimers({ toFake: ["Date"] });
  at("2026-10-11T00:05:00Z");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("AuroraView", () => {
  it("shows the visibility latitude from the likely and the high Kp", () => {
    render(wrap(<AuroraView initial={forecast} />));
    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(rows[1]).getByText("about 56°")).toBeTruthy(); // +1 h p50 = Kp 5
    expect(within(rows[1]).getByText("about 52°")).toBeTruthy(); // +1 h p90 = Kp 7
    expect(within(rows[2]).getAllByText("Poleward of 56°")).toHaveLength(2);
    expect(screen.getByText(/only in extreme storms/)).toBeTruthy();
  });
  it("states what the map shows and keeps the table when the map cannot load", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("nope", { status: 404 })));
    render(wrap(<AuroraView initial={forecast} />));
    expect(screen.getByText(/highest value forecast over the next 6 hours/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/Map unavailable/)).toBeTruthy());
    expect(screen.getByRole("table")).toBeTruthy();
  });
  it("lets a visitor check a place against the highest forecast Kp", () => {
    render(wrap(<AuroraView initial={forecast} />));
    fireEvent.change(screen.getByLabelText("Place"), { target: { value: "Tromsø" } });
    // Highest p50 is Kp 7 (52 degrees), highest p90 is Kp 8 (50 degrees); Tromsø is about 67 degrees geomagnetic.
    expect(screen.getByText(/Likely: in reach/)).toBeTruthy();
  });
  it("says so when the forecast is old", () => {
    at("2026-10-11T00:30:00Z");
    render(wrap(<AuroraView initial={forecast} />));
    expect(screen.getByRole("status").textContent).toMatch(/older than 15 minutes/);
  });
  it("shows when the page last refreshed", () => {
    render(wrap(<AuroraView initial={forecast} />));
    expect(screen.getByText(/Refreshed 2026-10-11 00:05 UTC/)).toBeTruthy();
  });
  it("says so when there is no forecast and the API stays down", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
    render(wrap(<AuroraView initial={null} />));
    await waitFor(() => expect(screen.getByText(/Forecast unavailable/)).toBeTruthy(), { timeout: 4000 });
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("GnssView", () => {
  it("shows a risk per horizon with advice and the 6-hour and scintillation caveats", () => {
    render(wrap(<GnssView initial={forecast} />));
    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(within(rows[1]).getAllByText("Moderate")).toHaveLength(1); // p50 Kp 5 = G1
    expect(within(rows[1]).getByText(/High/)).toBeTruthy(); // p90 Kp 7 = G3
    expect(within(rows[2]).getAllByText("Low")).toHaveLength(2); // p50 2.3 and p90 4.0
    expect(within(rows[3]).getByText(/reschedul/i)).toBeTruthy();
    expect(screen.getByText(/next 6 hours only/)).toBeTruthy();
    expect(screen.getByText(/scintillation/i)).toBeTruthy();
  });
  it("says so when there is no forecast and the API stays down", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
    render(wrap(<GnssView initial={null} />));
    await waitFor(() => expect(screen.getByText(/Forecast unavailable/)).toBeTruthy(), { timeout: 4000 });
  });
});
