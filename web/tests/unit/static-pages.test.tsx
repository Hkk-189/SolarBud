import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ApiDocs, { metadata as apiMeta } from "@/app/api-docs/page";
import Backtest, { metadata as backtestMeta } from "@/app/backtest/page";
import Models, { metadata as modelsMeta } from "@/app/models/page";
import { StormTimeline, timelineX } from "@/components/backtest/storm-timeline";
import { BACKTESTS } from "@/lib/backtests";

afterEach(cleanup);

describe("Models", () => {
  it("has one h1, a score table, and the Kp 7 caveat", () => {
    render(<Models />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(modelsMeta.title).toBe("Models");
    const table = screen.getByRole("table", { name: /scores on held-out data/i });
    expect(within(table).getAllByRole("row")).toHaveLength(1 + 9);
    expect(within(table).getByText("+0.250")).toBeTruthy();
    expect(screen.getByText(/and 5% at \+6 h/)).toBeTruthy();
  });
});

describe("Backtests", () => {
  it("lists all five storms with their events and no lead-time number", () => {
    render(<Backtest />);
    expect(backtestMeta.title).toBe("Backtests");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(BACKTESTS.length);
    expect(screen.getAllByRole("img", { name: /timeline/i })).toHaveLength(BACKTESTS.length);
    expect(screen.getByText("2024-05-10 17:15 UTC")).toBeTruthy();
    expect(screen.queryByText(/lead/i)).toBeNull();
  });

  it("maps times onto the timeline and keeps them in range", () => {
    const t0 = Date.parse("2024-05-10T00:00:00Z");
    const t1 = Date.parse("2024-05-12T00:00:00Z");

    expect(timelineX(t0, t0, t1)).toBe(0);
    expect(timelineX(t1, t0, t1)).toBe(1000);
    expect(timelineX(t0 - 1e9, t0, t1)).toBe(0);
  });

  it("labels each mark on a timeline", () => {
    render(<StormTimeline storm={BACKTESTS[3]} />);
    expect(screen.getByRole("img", { name: /Gannon storm, May 2024 timeline/ })).toBeTruthy();
  });
});

describe("API docs", () => {
  it("documents every endpoint from the OpenAPI spec", () => {
    render(<ApiDocs />);
    expect(apiMeta.title).toBe("API docs");

    for (const path of ["/v1/forecast/kp", "/v1/kp", "/v1/solar-wind", "/v1/solar-wind/latest", "/v1/alerts/current"]) {
      expect(screen.getByRole("heading", { name: new RegExp(`GET ${path}$`) })).toBeTruthy();
    }

    expect(screen.getAllByText(/curl /).length).toBeGreaterThan(0);
  });
});
