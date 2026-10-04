export function formatNum(v: number | null | undefined, digits: number): string {
  return v == null || Number.isNaN(v) ? "—" : v.toFixed(digits);
}

/** ISO-8601 -> "YYYY-MM-DD HH:MM UTC". The API always sends UTC. */
export function formatUtc(iso: string): string {
  return `${new Date(iso).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
