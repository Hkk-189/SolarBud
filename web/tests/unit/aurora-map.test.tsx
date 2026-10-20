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
  await waitFor(() => expect(screen.getByTestId("map")).toBeTruthy(), { timeout: 5000 });
  expect(screen.getByTestId("map").getAttribute("aria-label")).toMatch(/54°.*52°/);
});

it("says the map is unavailable when the outline cannot be loaded", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response("nope", { status: 404 })));
  render(<AuroraMap likelyKp={6} highKp={7} marker={null} Chart={FakeChart} />);
  await waitFor(() => expect(screen.getByText(/Map unavailable/)).toBeTruthy(), { timeout: 5000 });
  expect(screen.queryByTestId("map")).toBeNull();
});

it("does not describe lines that are not drawn when the aurora stays below Kp 5", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(Response.json(land)));
  render(<AuroraMap likelyKp={3} highKp={4} marker={null} Chart={FakeChart} />);
  await waitFor(() => expect(screen.getByTestId("map")).toBeTruthy(), { timeout: 5000 });
  expect(screen.queryByText(/solid line/)).toBeNull();
  expect(screen.getByText(/stays poleward of 56° geomagnetic latitude/)).toBeTruthy();
});

it("tells a screen reader that the aurora stays poleward but could reach a latitude", async () => {
  vi.stubGlobal("fetch", () => Promise.resolve(Response.json(land)));
  render(<AuroraMap likelyKp={3} highKp={6} marker={null} Chart={FakeChart} />);
  await waitFor(() => expect(screen.getByTestId("map")).toBeTruthy(), { timeout: 5000 });
  expect(screen.getByTestId("map").getAttribute("aria-label")).toMatch(/stays poleward of 56°.*could reach about 54°/);
});

it("shows a visible loading line, not a blank box, while the outline is still loading", () => {
  vi.stubGlobal("fetch", () => new Promise<Response>(() => undefined)); // never answers
  render(<AuroraMap likelyKp={6} highKp={7} marker={null} Chart={FakeChart} />);
  expect(screen.getByText("Loading map…")).toBeTruthy();
});
