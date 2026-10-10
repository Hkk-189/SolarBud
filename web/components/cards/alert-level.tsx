import { formatUtc } from "@/lib/format";
import type { AlertStatus, ApiResult } from "@/lib/api/client";

const DOT = new Map([
  ["warning", "var(--warning)"],
  ["active", "var(--danger)"],
  ["all_clear", "var(--success)"],
]);

function label(level: string, caveat: string | null): string {
  if (level === "none") {
    if (!caveat) return "No active alert";

    return `No active alert${caveat.startsWith("no current") ? " reported" : ""} (${caveat})`;
  }

  if (level === "all_clear") return caveat ? `All clear (${caveat})` : "All clear";

  return level.charAt(0).toUpperCase() + level.slice(1);
}

/** Alert level in words; the dot is decoration, never the only signal. */
export function AlertLevel({
  result,
  caveat,
}: {
  result: ApiResult<AlertStatus>;
  /** Why a quiet level cannot be trusted, or null when the forecast is fresh. */
  caveat: string | null;
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
        {label(level, caveat)}
      </p>
      {since ? <p className="text-muted">Since {formatUtc(since)}</p> : null}
    </div>
  );
}
