import { formatUtc } from "@/lib/format";
import type { AlertStatus, ApiResult } from "@/lib/api/client";

const DOT = new Map([
  ["warning", "var(--warning)"],
  ["active", "var(--danger)"],
  ["all_clear", "var(--success)"],
]);

function label(level: string, stale: boolean): string {
  if (level === "none") {
    return stale ? "No active alert (data stale, alerts may be suppressed)" : "No active alert";
  }

  if (level === "all_clear") return "All clear";

  return level.charAt(0).toUpperCase() + level.slice(1);
}

/** Alert level in words; the dot is decoration, never the only signal. */
export function AlertLevel({
  result,
  stale,
}: {
  result: ApiResult<AlertStatus>;
  stale: boolean;
}) {
  if (!result.ok) return <p className="mt-3 text-sm text-muted">Alert status unavailable</p>;

  const { level, since } = result.data;
  const dot = DOT.get(level);

  return (
    <div className="mt-3 text-sm">
      <p className="flex items-center gap-2 font-semibold">
        <span
          aria-hidden="true"
          className="inline-block size-2.5 rounded-full border border-outline"
          style={dot ? { backgroundColor: dot, borderColor: dot } : undefined}
        />
        {label(level, stale)}
      </p>
      {since ? <p className="text-muted">Since {formatUtc(since)}</p> : null}
    </div>
  );
}
