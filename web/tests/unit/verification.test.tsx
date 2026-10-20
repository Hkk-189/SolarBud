import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VerificationChart } from "@/components/charts/verification-chart";
import type { VerificationPoint } from "@/lib/api/client";
import { verificationOption } from "@/lib/chart-options";
import { scoreVerification } from "@/lib/verification";

const COLORS = { line: "#423d38", text: "#6f665d", grid: "#e3e0dd", band: "#fe6e00", g1: "#874b00", uncertainty: "#c25100" };

const pt = (hour: number, p10: number, p50: number, p90: number, observed: number | null): VerificationPoint => ({
  bin_start: `2026-10-11T${String(hour).padStart(2, "0")}:00:00Z`,
  issued_at: `2026-10-11T${String(hour - 3).padStart(2, "0")}:10:00Z`,
  p10,
  p50,
  p90,
  observed_kp: observed,
});

const points = [
  pt(6, 2, 3, 4, 3.3), // inside
  pt(9, 2, 3, 4, 4), // on the edge counts as inside
  pt(12, 2, 3, 4, 6), // outside
  pt(15, 2, 3, 4, null), // not observed yet: not scored
];

describe("scoreVerification", () => {
  it("counts observed values inside p10 to p90, edges included, ignoring unobserved bins", () => {
    expect(scoreVerification(points)).toEqual({ inside: 2, total: 3 });
  });
  it("is 0 of 0 with nothing observed", () => {
    expect(scoreVerification([pt(6, 1, 2, 3, null)])).toEqual({ inside: 0, total: 0 });
    expect(scoreVerification([])).toEqual({ inside: 0, total: 0 });
  });
});

describe("verificationOption", () => {
  const o = verificationOption({ points, utc: true, colors: COLORS });
  const mid = (hour: number) => Date.parse(`2026-10-11T${String(hour).padStart(2, "0")}:00:00Z`) + 1.5 * 3600 * 1000;

  it("stacks the p10 to p90 spread on p10 at the middle of each bin", () => {
    expect(o.series[0]!.data).toEqual([[mid(6), 2], [mid(9), 2], [mid(12), 2], [mid(15), 2]]);
    expect(o.series[1]!.data).toEqual([[mid(6), 2], [mid(9), 2], [mid(12), 2], [mid(15), 2]]);
    expect(o.series[0]!.stack).toBe(o.series[1]!.stack);
  });
  it("draws the median, the G1 line and the observed Kp as steps that skip unobserved bins", () => {
    expect(o.series[2]!.name).toBe("Forecast made 3 h ahead");
    expect(o.series[2]!.markLine?.data[0]?.yAxis).toBeCloseTo(4.667, 2);
    expect(o.series[3]!.name).toBe("Observed Kp");
    expect(o.series[3]!.data).toHaveLength(2 * 3); // 3 observed bins, a step start and end each
  });
});

describe("verificationOption gaps", () => {
  it("breaks the band and the median where bins are missing instead of drawing across them", () => {
    const o = verificationOption({ points: [pt(6, 2, 3, 4, 3), pt(15, 2, 3, 4, 3)], utc: true, colors: COLORS });

    for (const i of [0, 1, 2]) expect(o.series[i]!.data.some((d) => Array.isArray(d) && d[1] === null)).toBe(true);
    expect(o.series[0]!.data).toHaveLength(3);
  });
});

describe("VerificationChart", () => {
  const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const FakeChart = () => <div data-testid="chart" />;
  const wrap = (ui: React.ReactNode) => <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>;

  beforeEach(() => vi.stubGlobal("matchMedia", () => media));

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("says how many observed values fell inside the likely range", () => {
    render(wrap(<VerificationChart initial={points} Chart={FakeChart} />));
    expect(screen.getByText("2 of 3 observed values fell inside the likely range.")).toBeTruthy();
    expect(screen.getByTestId("chart")).toBeTruthy();
  });
  it("tells an empty window (no forecasts issued, e.g. the worker was off) from one with nothing observed yet", () => {
    render(wrap(<VerificationChart initial={[]} Chart={FakeChart} />));
    expect(screen.getByText("No forecasts issued in the last 48 hours.")).toBeTruthy();
    expect(screen.queryByText(/No completed 3-hour periods/)).toBeNull();
  });
  it("says there is nothing to compare yet instead of 0 of 0", () => {
    render(wrap(<VerificationChart initial={[pt(6, 1, 2, 3, null)]} Chart={FakeChart} />));
    expect(screen.getByText("No completed 3-hour periods yet.")).toBeTruthy();
    expect(screen.queryByText(/fell inside/)).toBeNull();
  });
  it("says so when there is no data and the API stays down", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("{}", { status: 503 })));
    render(wrap(<VerificationChart initial={null} Chart={FakeChart} />));
    expect(await screen.findByText(/Comparison unavailable/, undefined, { timeout: 4000 })).toBeTruthy();
  });
});
