import { describe, expect, it } from "vitest";
import { G1_KP, gLevel, gStart } from "@/lib/g-level";

// Mirrors backend/app/core/constants.py: G_n starts at Kp >= (n + 4) - 1/3, with a 1e-3 tolerance.
describe("gLevel", () => {
  it.each([
    [0, 0],
    [4.66, 0],
    [4.667, 1],
    [5.66, 1],
    [5.667, 2],
    [6.667, 3],
    [7.667, 4],
    [8.667, 5],
    [9, 5],
  ])("Kp %f is G%i", (kp, g) => {
    expect(gLevel(kp)).toBe(g);
  });

  it("puts the G1 chart line exactly where gLevel turns G1", () => {
    expect(gLevel(G1_KP)).toBe(1);
    expect(gLevel(G1_KP - 0.01)).toBe(0);
  });

  it("returns null for unknown Kp", () => {
    expect(gLevel(Number.NaN)).toBeNull();
  });
});

describe("gStart", () => {
  it("is the G1 threshold for n = 1", () => {
    expect(gStart(1)).toBe(G1_KP);
  });
});
