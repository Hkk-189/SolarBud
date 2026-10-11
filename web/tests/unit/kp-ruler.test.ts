import { describe, expect, it } from "vitest";
import type { KpForecast, KpPoint } from "@/lib/api/client";
import { gStart } from "@/lib/g-level";
import { kpRuler } from "@/lib/kp-ruler";

const fc = (hs: [number, number, number, number][]): KpForecast => ({
  data_stale: false,
  issued_at: "2026-10-11T00:00:00Z",
  model_version: "t",
  horizons: hs.map(([horizon_h, p10, p50, p90]) => ({ horizon_h, p10, p50, p90 })),
});

const forecast = fc([
  [1, 3, 4, 5],
  [3, 2.5, 4.2, 5.6],
  [6, 2, 4.5, 6.5],
]);

const pt = (kp: number | null): KpPoint => ({ time: "2026-10-11T00:00:00Z", kp });

describe("kpRuler", () => {
  it("builds six bands with edges from gStart", () => {
    const edges = kpRuler(forecast, null).bands.map((b) => [b.from, b.to]);

    expect(edges).toEqual([
      [0, gStart(1)],
      [gStart(1), gStart(2)],
      [gStart(2), gStart(3)],
      [gStart(3), gStart(4)],
      [gStart(4), gStart(5)],
      [gStart(5), 9],
    ]);
    expect(kpRuler(forecast, null).bands.map((b) => b.g)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(gStart(2)).toBeCloseTo(5.667, 3);
  });

  it("orders lanes Now, In 1 h, In 3 h, In 6 h", () => {
    expect(kpRuler(forecast, null).lanes.map((l) => l.label)).toEqual([
      "Now",
      "In 1 h",
      "In 3 h",
      "In 6 h",
    ]);
  });

  it("uses the last non-null observed point for Now", () => {
    const now = kpRuler(forecast, [pt(2), pt(4), pt(null)]).lanes[0];

    expect(now.p50).toBe(4);
    expect(now.kind).toBe("observed");
    expect(now.text).toBe("Now: Kp 4.0 (G0)");
  });

  it.each([[null], [[]], [[pt(null), pt(null)]]])("has no observation for %j", (observed) => {
    const now = kpRuler(forecast, observed).lanes[0];

    expect(now.p50).toBeNull();
    expect(now.text).toBe("Now: no recent observation");
  });

  it("gives three no-forecast lanes when forecast is null", () => {
    const lanes = kpRuler(null, null).lanes.slice(1);

    expect(lanes.map((l) => l.p50)).toEqual([null, null, null]);
    expect(lanes.map((l) => l.text)).toEqual([
      "In 1 hour: no forecast",
      "In 3 hours: no forecast",
      "In 6 hours: no forecast",
    ]);
  });

  it("gives a no-forecast lane for a missing horizon", () => {
    const lanes = kpRuler(fc([[3, 2, 4, 5]]), null).lanes;

    expect(lanes[1].text).toBe("In 1 hour: no forecast");
    expect(lanes[2].p50).toBe(4);
  });

  it("clamps p90 and p10 to the 0-9 scale", () => {
    const lane = kpRuler(fc([[1, -0.2, 7.3, 9.5]]), null).lanes[1];

    expect(lane.p10).toBe(0);
    expect(lane.p90).toBe(9);
  });

  it("swaps an inverted range", () => {
    const lane = kpRuler(fc([[1, 6, 5, 4]]), null).lanes[1];

    expect([lane.p10, lane.p90]).toEqual([4, 6]);
  });

  it("writes the lane text with one decimal and the G range", () => {
    expect(kpRuler(forecast, null).lanes[2].text).toBe(
      "In 3 hours: likely Kp 4.2 (G0), range 2.5 to 5.6 (G0 to G1)",
    );
  });

  it("writes a single G when p10 and p90 share a band", () => {
    expect(kpRuler(fc([[1, 3, 4, 4.5]]), null).lanes[1].text).toBe(
      "In 1 hour: likely Kp 4.0 (G0), range 3.0 to 4.5 (G0)",
    );
  });
});
