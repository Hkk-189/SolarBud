import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Backtest from "@/app/backtest/page";
import { TimelineLegend } from "@/components/backtest/storm-timeline";
import { StormRuler } from "@/components/home/storm-ruler";
import type { KpForecast } from "@/lib/api/client";

afterEach(cleanup);

function need(el: HTMLElement | null): HTMLElement {
  if (!el) throw new Error("expected an element");

  return el;
}

const forecast: KpForecast = {
  data_stale: false,
  issued_at: "2026-10-11T00:00:00Z",
  model_version: "t",
  horizons: [{ horizon_h: 1, p10: 3, p50: 4, p90: 5 }],
};

const NOW = Date.parse("2026-10-11T00:10:00Z");

describe("ruler legend", () => {
  it("sits behind a collapsed 'How to read this' control, outside the chart image", () => {
    render(<StormRuler nowMs={NOW} forecast={forecast} observed={null} />);
    const summary = screen.getByText("How to read this");
    const details = need(summary.closest("details"));

    expect(details.hasAttribute("open")).toBe(false);
    expect(screen.getByRole("img").contains(summary)).toBe(false);
    expect(within(details).getByText(/Likely Kp/)).toBeTruthy();
    expect(within(details).getByText(/8 times out of 10/)).toBeTruthy();
    expect(within(details).getByText(/A storm starts at G1/)).toBeTruthy();
  });
});

describe("timeline legend", () => {
  it("draws all three marks and the shaded box with their meanings", () => {
    const { container } = render(<TimelineLegend />);

    for (const name of ["Warning", "Active", "All clear", "Storm dates"]) {
      expect(screen.getByText(new RegExp(`^${name}`))).toBeTruthy();
    }

    expect(container.querySelectorAll("svg")).toHaveLength(4);
    expect(screen.getByText(/dates are UTC/i)).toBeTruthy();
  });

  it("is a collapsed 'How to read this' control on the Backtests page", () => {
    render(<Backtest />);
    const details = need(screen.getByText("How to read this").closest("details"));

    expect(details.hasAttribute("open")).toBe(false);
    expect(within(details).getByText(/false warning/i)).toBeTruthy();
  });
});
