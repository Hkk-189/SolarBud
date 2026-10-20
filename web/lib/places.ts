/** A few places to pick from. Coordinates are geographic, rounded to 2 decimals. */
export const PLACES: Place[] = [
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59 },
  { name: "Leh", lat: 34.15, lon: 77.58 },
  { name: "Kolkata", lat: 22.57, lon: 88.36 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Tromsø", lat: 69.65, lon: 18.96 },
];

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface PlaceResult {
  place: Place | null;
  error: string | null;
}

/** A listed place, or a custom one from two text fields. Empty means "nothing chosen yet", not an error. */
export function resolvePlace(choice: string, latText: string, lonText: string): PlaceResult {
  if (choice === "") return { place: null, error: null };

  if (choice !== "custom") {
    return { place: PLACES.find((p) => p.name === choice) ?? null, error: null };
  }

  if (latText.trim() === "" || lonText.trim() === "") return { place: null, error: null };

  const lat = Number(latText);
  const lon = Number(lonText);

  if (!(Math.abs(lat) <= 90)) return { place: null, error: "Latitude must be a number from -90 to 90." };

  if (!(Math.abs(lon) <= 180)) return { place: null, error: "Longitude must be a number from -180 to 180." };

  return { place: { name: "Your place", lat, lon }, error: null };
}
