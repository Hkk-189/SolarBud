import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StormRuler } from "@/components/home/storm-ruler";
import type { KpForecast } from "@/lib/api/client";

const forecast: KpForecast = {
  data_stale: false,
  issued_at: "2026-10-11T00:00:00Z",
  model_version: "t",
  horizons: [
    { horizon_h: 1, p10: 3, p50: 4, p90: 5 },
    { horizon_h: 3, p10: 2.5, p50: 4.2, p90: 5.6 },
    { horizon_h: 6, p10: 2, p50: 4.5, p90: 6.5 },
  ],
};

const NOW = Date.parse("2026-10-11T01:00:00Z");

describe("StormRuler", () => {
  it("draws the lane baseline with bg-outline", () => {
    const { container } = render(<StormRuler nowMs={NOW} forecast={forecast} observed={null} />);

    expect(container.querySelector(".bg-outline")).not.toBeNull();
  });

  it("is one image whose name carries the lane texts", () => {
    const { container } = render(
      <StormRuler nowMs={NOW} forecast={forecast} observed={[{ time: "2026-10-11T00:00:00Z", kp: 4 }]} />,
    );

    const img = within(container).getByRole("img");

    expect(img.getAttribute("aria-label")).toContain(
      "In 3 hours: likely Kp 4.2 (G0), range 2.5 to 5.6 (G0 to G1)",
    );
    expect(img.getAttribute("aria-label")).toContain("Now: Kp 4.0 (G0)");
  });

  it("writes each band's G label", () => {
    const { container } = render(<StormRuler nowMs={NOW} forecast={forecast} observed={null} />);

    for (const g of ["G0", "G1", "G2", "G3", "G4", "G5"]) {
      expect(within(container).getByText(g)).toBeTruthy();
    }
  });

  it("uses no middle dots", () => {
    const { container } = render(<StormRuler nowMs={NOW} forecast={forecast} observed={null} />);

    expect(container.textContent).not.toContain("·");
  });

  it("renders three no-forecast lanes when the forecast is null", () => {
    const { container } = render(<StormRuler nowMs={NOW} forecast={null} observed={null} />);

    expect(within(container).getAllByText("no forecast")).toHaveLength(3);
    expect(within(container).getByText("G0")).toBeTruthy();
  });
});
