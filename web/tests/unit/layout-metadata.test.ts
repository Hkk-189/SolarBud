import { expect, it } from "vitest";
import { siteTitle } from "@/lib/site-title";

it("names tabs 'Page - SolarBud' and keeps the plain name for the home page", () => {
  expect(siteTitle).toEqual({ default: "SolarBud", template: "%s - SolarBud" });
});
