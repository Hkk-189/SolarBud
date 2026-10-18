import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuroraView, GnssView } from "@/components/forecast/aurora-gnss";
import type { KpForecast } from "@/lib/api/client";

afterEach(cleanup);

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

const NOW = Date.parse("2026-10-11T00:05:00Z");

const down = { ok: false } as const;

describe("AuroraView", () => {
  it("shows the visibility latitude from the likely and the high Kp", () => {
    render(<AuroraView nowMs={NOW} result={{ ok: true, data: forecast }} />);
    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(rows[1]).getByText("about 56°")).toBeTruthy(); // +1 h p50 = Kp 5
    expect(within(rows[1]).getByText("about 52°")).toBeTruthy(); // +1 h p90 = Kp 7
    expect(within(rows[2]).getAllByText("Poleward of 56°")).toHaveLength(2);
    expect(screen.getByText(/only in extreme storms/)).toBeTruthy();
  });
  it("says so when the forecast is old or unavailable", () => {
    const old = Date.parse("2026-10-11T00:30:00Z");
    const { unmount } = render(<AuroraView nowMs={old} result={{ ok: true, data: forecast }} />);

    expect(screen.getByRole("status").textContent).toMatch(/older than 15 minutes/);
    unmount();
    render(<AuroraView nowMs={NOW} result={down} />);
    expect(screen.getByText(/Forecast unavailable/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("GnssView", () => {
  it("shows a risk per horizon with advice and the 6-hour and scintillation caveats", () => {
    render(<GnssView nowMs={NOW} result={{ ok: true, data: forecast }} />);
    const rows = within(screen.getByRole("table")).getAllByRole("row");

    expect(within(rows[1]).getAllByText("Moderate")).toHaveLength(1); // p50 Kp 5 = G1
    expect(within(rows[1]).getByText(/High/)).toBeTruthy(); // p90 Kp 7 = G3
    expect(within(rows[2]).getAllByText("Low")).toHaveLength(2); // p50 2.3 and p90 4.0
    expect(within(rows[3]).getByText(/reschedul/i)).toBeTruthy();
    expect(screen.getByText(/next 6 hours only/)).toBeTruthy();
    expect(screen.getByText(/scintillation/i)).toBeTruthy();
  });
  it("says so when the forecast is unavailable", () => {
    render(<GnssView nowMs={NOW} result={down} />);
    expect(screen.getByText(/Forecast unavailable/)).toBeTruthy();
  });
});
