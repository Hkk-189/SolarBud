import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SolarWindCharts } from "@/components/charts/solar-wind-charts";
import type { SolarWindPoint } from "@/lib/api/client";

const FakeChart = () => <div data-testid="chart" />;

const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

beforeEach(() => vi.stubGlobal("matchMedia", () => media)); // jsdom has no matchMedia

afterEach(() => vi.unstubAllGlobals());

const initial: SolarWindPoint[] = [{ time: "2024-05-10T18:00:00Z", speed_kms: 500 }];

const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {ui}
  </QueryClientProvider>
);

it("draws four charts from the server-provided data and toggles UTC / local", () => {
  render(wrap(<SolarWindCharts initial={initial} Chart={FakeChart} />));
  expect(screen.getAllByTestId("chart")).toHaveLength(4);
  const toggle = screen.getByRole("button", { name: /UTC/ });
  expect(toggle.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(toggle);
  expect(screen.getByRole("button", { name: /local/i }).getAttribute("aria-pressed")).toBe("false");
});

it("shows an unavailable message when there is no data at all", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
  render(wrap(<SolarWindCharts initial={null} Chart={FakeChart} />));
  expect(await screen.findByText(/history unavailable/i, {}, { timeout: 4000 })).toBeTruthy();
});
