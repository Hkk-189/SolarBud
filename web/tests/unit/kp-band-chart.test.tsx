import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { KpBandChart } from "@/components/charts/kp-band-chart";
import { EXPLAIN } from "@/lib/explanations";
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

const observed = [{ time: "2024-05-10T15:00:00Z", kp: 4 }];

it("draws the band from the server-provided forecast and names the G1 line", () => {
  render(wrap(<KpBandChart initial={base} initialObserved={observed} Chart={FakeChart} />));
  expect(screen.getAllByTestId("chart")).toHaveLength(1);
  expect(screen.queryByText(/stale/i)).toBeNull();
  expect(screen.getByText(/dashed line is G1/i)).toBeTruthy();
});

it("explains the chart in plain language", () => {
  const { container } = render(wrap(<KpBandChart initial={base} initialObserved={observed} Chart={FakeChart} />));
  expect(within(container).getByText(EXPLAIN.kpChart.summary)).toBeTruthy();
});

it("says the forecast is over 15 minutes old once it is", () => {
  const { container } = render(wrap(<KpBandChart initial={base} initialObserved={observed} Chart={FakeChart} />));
  expect(within(container).getByText(/over 15 min old/i)).toBeTruthy();
});

it("says nothing about age for a fresh forecast", () => {
  const fresh = { ...base, issued_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() };
  const { container } = render(wrap(<KpBandChart initial={fresh} initialObserved={observed} Chart={FakeChart} />));
  expect(within(container).queryByText(/over 15 min old/i)).toBeNull();
});

it("warns when the forecast was made from stale L1 data", () => {
  render(wrap(<KpBandChart initial={{ ...base, data_stale: true }} initialObserved={observed} Chart={FakeChart} />));
  expect(screen.getByText(/stale/i)).toBeTruthy();
});

it("keeps the forecast chart when observed Kp is missing and its fetch fails", async () => {
  const f = vi.fn(() => Promise.resolve(new Response("{}", { status: 503 })));
  vi.stubGlobal("fetch", f);
  const { container } = render(wrap(<KpBandChart initial={base} initialObserved={null} Chart={FakeChart} />));
  await vi.waitFor(() => expect(f).toHaveBeenCalledWith("/api/kp-observed"), { timeout: 4000 });
  await vi.waitFor(() => expect(f).toHaveBeenCalledTimes(2), { timeout: 4000 }); // the one retry
  expect(within(container).getAllByTestId("chart")).toHaveLength(1);
  expect(within(container).queryByText(/unavailable/i)).toBeNull();
});

it("says so when there is no forecast", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
  render(wrap(<KpBandChart initial={null} initialObserved={null} Chart={FakeChart} />));
  expect(await screen.findByText(/forecast unavailable/i, {}, { timeout: 4000 })).toBeTruthy();
});
