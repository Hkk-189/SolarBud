import { gLevel } from "@/lib/g-level";

/** Storm level pill. The level is always written out, so color is never the only signal. */
export function GLevelBadge({ kp }: { kp: number }) {
  const g = gLevel(kp);

  const style =
    g === null
      ? { backgroundColor: "var(--surface-soft)", color: "var(--muted)" }
      : { backgroundColor: `var(--g${g}-bg)`, color: `var(--g${g}-fg)` };

  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
      style={style}
      aria-label={g === null ? "Storm level unknown" : `Geomagnetic storm level G${g}`}
    >
      {g === null ? "No data" : `G${g}`}
    </span>
  );
}
