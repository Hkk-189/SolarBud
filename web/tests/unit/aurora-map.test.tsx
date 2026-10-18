import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuroraMap } from "@/components/forecast/aurora-map";

const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

const FakeChart = ({ label }: { label: string }) => <div data-testid="map" aria-label={label} />;

const land = { type: "FeatureCollection", features: [] };

beforeEach(() => vi.stubGlobal("matchMedia", () => media)); // jsdom has no matchMedia

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("draws the map once the land outline has loaded", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(Response.json(land)));
  render(<AuroraMap likelyKp={6} highKp={7} marker={null} Chart={FakeChart} />);
  await waitFor(() => expect(screen.getByTestId("map")).toBeTruthy());
  expect(screen.getByTestId("map").getAttribute("aria-label")).toMatch(/54°.*52°/);
});

it("says the map is unavailable when the outline cannot be loaded", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("nope", { status: 404 })));
  render(<AuroraMap likelyKp={6} highKp={7} marker={null} Chart={FakeChart} />);
  await waitFor(() => expect(screen.getByText(/Map unavailable/)).toBeTruthy());
  expect(screen.queryByTestId("map")).toBeNull();
});
