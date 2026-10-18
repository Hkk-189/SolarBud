import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LiveStormHero } from "@/components/home/live-storm-hero";
import type { AlertStatus, KpForecast } from "@/lib/api/client";
import { statusSummary } from "@/lib/status-summary";

const forecast: KpForecast = {
  issued_at: "2026-10-11T00:00:00Z",
  model_version: "t",
  data_stale: false,
  horizons: [
    { horizon_h: 1, p10: 1, p50: 2, p90: 3 },
    { horizon_h: 3, p10: 1, p50: 2, p90: 3 },
    { horizon_h: 6, p10: 1, p50: 2, p90: 3 },
  ],
};

const NOW = Date.parse("2026-10-11T00:05:00Z");

const quiet: AlertStatus = { level: "none", since: null };

const warning: AlertStatus = { level: "warning", since: "2026-10-11T00:04:00Z", last_event: null };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("starts from the server data, then follows a refetched alert", async () => {
  const client = new QueryClient();
  const down = { ok: false } as const;

  const bodies = new Map<string, unknown>([
    ["/api/alert-current", warning],
    ["/api/kp-forecast", forecast],
    ["/api/kp-observed", []],
  ]);

  vi.stubGlobal("fetch", (url: string) => Promise.resolve(Response.json(bodies.get(url) ?? {})));
  render(
    <QueryClientProvider client={client}>
      <LiveStormHero
        forecast={{ ok: true, data: forecast }}
        alert={{ ok: true, data: quiet }}
        observed={down}
        serverNowMs={NOW}
      />
    </QueryClientProvider>,
  );
  const quietText = statusSummary({ ok: true, data: forecast }, { ok: true, data: quiet }, NOW);
  const warnText = statusSummary({ ok: true, data: forecast }, { ok: true, data: warning }, NOW);

  expect(quietText).not.toBe(warnText);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(quietText);
  expect(screen.getByText(/Refreshed 2026-10-11 00:05 UTC/)).toBeTruthy();

  await act(() => client.refetchQueries({ queryKey: ["alert-current"] }));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(warnText));
});
