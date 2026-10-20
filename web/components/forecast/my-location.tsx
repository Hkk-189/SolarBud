"use client";

import { useState } from "react";
import { AURORA_FLOOR_LAT, auroraLatitude } from "@/lib/aurora-gnss";
import { geomagneticLatitude } from "@/lib/geomag";
import { PLACES, resolvePlace, type Place } from "@/lib/places";

const FIELD = "rounded-input border border-outline bg-card px-2 py-1 text-sm";

const reach = (magLat: number, kp: number) => {
  const edge = auroraLatitude(kp);

  // The rule only gives the edge from Kp 5 up. Below that it is poleward of the Kp 5 edge, so a place
  // equatorward of that edge is out of reach, and one poleward of it is simply not covered.
  if (edge === null) return Math.abs(magLat) >= AURORA_FLOOR_LAT ? "can't say below Kp 5" : "not in reach";

  return Math.abs(magLat) >= edge ? "in reach" : "not in reach";
};

/** Pick a place and see whether the aurora may reach it. Computed in the browser; nothing is stored or sent. */
export function MyLocation({
  likelyKp,
  highKp,
  onChange,
}: {
  likelyKp: number;
  highKp: number;
  onChange: (place: Place | null) => void;
}) {
  const [choice, setChoice] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const { place, error } = resolvePlace(choice, lat, lon);
  const magLat = place ? geomagneticLatitude(place.lat, place.lon) : null;

  const update = (next: { choice?: string; lat?: string; lon?: string }) => {
    const c = next.choice ?? choice;
    const la = next.lat ?? lat;
    const lo = next.lon ?? lon;

    setChoice(c);
    setLat(la);
    setLon(lo);
    onChange(resolvePlace(c, la, lo).place);
  };

  const fields = [
    { name: "Latitude", range: "-90 to 90", value: lat, set: (v: string) => update({ lat: v }) },
    { name: "Longitude", range: "-180 to 180", value: lon, set: (v: string) => update({ lon: v }) },
  ];

  return (
    <div className="mt-4 space-y-2 border-t border-outline pt-4">
      <h3 className="text-sm font-semibold">Check a place</h3>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Place" className={FIELD} value={choice} onChange={(e) => update({ choice: e.target.value })}>
          <option value="">Choose a place</option>
          {PLACES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
          <option value="custom">Other (latitude and longitude)</option>
        </select>
        {choice === "custom" &&
          fields.map((f) => (
            <input
              key={f.name}
              aria-label={`${f.name} (${f.range})`}
              className={`${FIELD} w-32`}
              inputMode="decimal"
              aria-invalid={error?.startsWith(f.name) ? true : undefined}
              aria-describedby={error?.startsWith(f.name) ? "place-error" : undefined}
              placeholder={f.name}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
            />
          ))}
      </div>
      <div aria-live="polite">
        {error && (
          <p id="place-error" role="alert" className="text-sm font-semibold">
            {error}
          </p>
        )}
        {place && magLat !== null && (
          <p className="text-sm">
            {place.name} is at about {Math.abs(Math.round(magLat))}° {magLat < 0 ? "S" : "N"} geomagnetic. Likely:{" "}
            {reach(magLat, likelyKp)}. Could reach: {reach(magLat, highKp)}.
          </p>
        )}
      </div>
      <p className="text-xs text-muted">Worked out in your browser; nothing is saved or sent.</p>
    </div>
  );
}
