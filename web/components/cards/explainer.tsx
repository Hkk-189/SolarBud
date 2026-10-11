import type { Explanation } from "@/lib/explanations";

export function Explainer({ explain }: { explain: Explanation }) {
  return (
    <>
      <p className="mt-1 text-sm text-muted">{explain.summary}</p>
      <details className="group mt-2 text-sm">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 rounded-control border border-outline px-2 py-0.5 text-xs font-semibold text-muted [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none">
            ▸
          </span>
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
