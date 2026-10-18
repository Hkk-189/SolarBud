import { describe, expect, it } from "vitest";
import { auroraLatitude, gnssRisk } from "@/lib/aurora-gnss";

describe("auroraLatitude (docs/context.md rule: Kp 5-9 -> 56, 54, 52, 50, 47)", () => {
  it("returns the table values at whole Kp", () => {
    expect([5, 6, 7, 8, 9].map(auroraLatitude)).toEqual([56, 54, 52, 50, 47]);
  });
  it("interpolates between table points", () => {
    expect(auroraLatitude(5.5)).toBe(55);
    expect(auroraLatitude(8.5)).toBe(48.5);
  });
  it("is null below Kp 5 and clamps at Kp 9", () => {
    expect(auroraLatitude(4.99)).toBeNull();
    expect(auroraLatitude(2.3)).toBeNull();
    expect(auroraLatitude(9.5)).toBe(47);
  });
});

describe("gnssRisk (< G1 Low, G1-G2 Moderate, G3 High, G4-G5 Severe)", () => {
  it.each([
    [2.3, "Low"],
    [4.33, "Low"],
    [4.67, "Moderate"],
    [6.0, "Moderate"],
    [7.0, "High"],
    [8.0, "Severe"],
    [9.0, "Severe"],
  ])("Kp %s is %s", (kp, risk) => {
    expect(gnssRisk(kp)).toBe(risk);
  });
  it("is null for a missing value", () => {
    expect(gnssRisk(Number.NaN)).toBeNull();
  });
});
