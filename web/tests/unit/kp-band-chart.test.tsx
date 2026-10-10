import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { KpBandChart } from "@/components/charts/kp-band-chart";
import type { KpForecast } from "@/lib/api/client";

const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

const FakeChart = () => <div data-testid="chart" />;

beforeEach(() => vi.stubGlobal("matchMedia", () => media)); // jsdom has no matchMedia

afterEach(() => vi.unstubAllGlobals());

const base: KpForecast = {
  issued_at: "2024-05-10T18:00:00Z",
  model_version: "test",
  data_stale: false,
  horizons: [{ horizon_h: 1, p10: 3, p50: 4, p90: 6 }],
};

const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
);

it("draws the band from the server-provided forecast", () => {
  render(wrap(<KpBandChart initial={base} Chart={FakeChart} />));
  expect(screen.getAllByTestId("chart")).toHaveLength(1);
  expect(screen.queryByText(/stale/i)).toBeNull();
});

it("warns when the forecast was made from stale L1 data", () => {
  render(wrap(<KpBandChart initial={{ ...base, data_stale: true }} Chart={FakeChart} />));
  expect(screen.getByText(/stale/i)).toBeTruthy();
});

it("says so when there is no forecast", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
  render(wrap(<KpBandChart initial={null} Chart={FakeChart} />));
  expect(await screen.findByText(/forecast unavailable/i, {}, { timeout: 4000 })).toBeTruthy();
});
