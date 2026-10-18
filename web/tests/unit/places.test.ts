import { describe, expect, it } from "vitest";
import { resolvePlace } from "@/lib/places";

describe("resolvePlace", () => {
  it("finds a listed place by name", () => {
    expect(resolvePlace("Leh", "", "")).toEqual({ place: { name: "Leh", lat: 34.15, lon: 77.58 }, error: null });
  });
  it("takes a custom latitude and longitude, ignoring spaces", () => {
    expect(resolvePlace("custom", " 12.5 ", "-70")).toEqual({
      place: { name: "Your place", lat: 12.5, lon: -70 },
      error: null,
    });
  });
  it("says nothing until a place is chosen or both custom fields are filled", () => {
    expect(resolvePlace("", "", "")).toEqual({ place: null, error: null });
    expect(resolvePlace("custom", "", "")).toEqual({ place: null, error: null });
    expect(resolvePlace("custom", "12", "")).toEqual({ place: null, error: null });
  });
  it.each([
    ["95", "10", "Latitude must be a number from -90 to 90."],
    ["-91", "10", "Latitude must be a number from -90 to 90."],
    ["abc", "10", "Latitude must be a number from -90 to 90."],
    ["10", "181", "Longitude must be a number from -180 to 180."],
    ["10", "x", "Longitude must be a number from -180 to 180."],
  ])("rejects lat %s lon %s with a message and no place", (lat, lon, error) => {
    expect(resolvePlace("custom", lat, lon)).toEqual({ place: null, error });
  });
});
