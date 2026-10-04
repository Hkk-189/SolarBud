import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GLevelBadge } from "@/components/cards/g-level-badge";

describe("GLevelBadge", () => {
  it("shows the level as text, not only as color", () => {
    render(<GLevelBadge kp={6.0} />);
    expect(screen.getByText("G2")).toBeTruthy();
  });

  it("shows a neutral 'No data' badge when Kp is unknown", () => {
    render(<GLevelBadge kp={Number.NaN} />);
    expect(screen.getByText("No data")).toBeTruthy();
  });
});
