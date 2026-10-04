import { describe, expect, it } from "vitest";
import { formatNum, formatUtc } from "@/lib/format";

describe("formatNum", () => {
  it("fixes decimals", () => expect(formatNum(5.333, 1)).toBe("5.3"));
  it("shows a dash for null, undefined and NaN", () => {
    expect(formatNum(null, 1)).toBe("—");
    expect(formatNum(undefined, 1)).toBe("—");
    expect(formatNum(Number.NaN, 1)).toBe("—");
  });
  it("keeps the minus sign", () => expect(formatNum(-4.26, 1)).toBe("-4.3"));
});

describe("formatUtc", () => {
  it("renders ISO timestamps as UTC text", () =>
    expect(formatUtc("2026-10-04T12:05:00Z")).toBe("2026-10-04 12:05 UTC"));
});
