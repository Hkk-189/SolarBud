import type { Explanation } from "@/lib/explanations";

export function Explainer({ explain }: { explain: Explanation }) {
  return (
    <>
      <p className="mt-1 text-sm text-muted">{explain.summary}</p>
      <details className="mt-2 text-sm">
        <summary className="inline-block cursor-pointer rounded-control border border-outline px-2 py-0.5 text-xs font-semibold text-muted">
          What does this mean?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {explain.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </details>
    </>
  );
}
