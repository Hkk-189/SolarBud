import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { KpBandChart } from "@/components/charts/kp-band-chart";
import { SolarWindCharts } from "@/components/charts/solar-wind-charts";
import { TimeZoneProvider } from "@/components/charts/time-zone";

const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

const FakeChart = () => <div />;

beforeEach(() => vi.stubGlobal("matchMedia", () => media)); // jsdom has no matchMedia

afterEach(() => vi.unstubAllGlobals());

it("one toggle switches every chart on the page", () => {
  const kp = {
    issued_at: "2024-05-10T18:00:00Z",
    model_version: "test",
    data_stale: false,
    horizons: [{ horizon_h: 1, p10: 3, p50: 4, p90: 6 }],
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <TimeZoneProvider>
        <KpBandChart initial={kp} initialObserved={[]} Chart={FakeChart} />
        <SolarWindCharts initial={[{ time: "2024-05-10T18:00:00Z" }]} Chart={FakeChart} />
      </TimeZoneProvider>
    </QueryClientProvider>,
  );
  expect(screen.getAllByRole("button", { name: "UTC" })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole("button", { name: "UTC" })[0]!);
  expect(screen.getAllByRole("button", { name: "Local time" })).toHaveLength(2);
});
