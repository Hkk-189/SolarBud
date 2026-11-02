import { formatUtc } from "@/lib/format";

export function DemoBanner({ at }: { at: string }) {
  return (
    <p role="status" className="mb-6 rounded-md border border-outline bg-surface px-4 py-3 text-sm text-foreground">
      The live API is not answering. Numbers that could not be fetched are shown from a recording made{" "}
      <span className="tabular-nums">{formatUtc(at)}</span>.
    </p>
  );
}
