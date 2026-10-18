/** Collapsed key for a chart. Same look as the Explainer's "What does this mean?" control. */
export function HowToRead({ children }: { children: React.ReactNode }) {
  return (
    <details className="group mt-3 text-sm">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 rounded-control border border-outline px-2 py-0.5 text-xs font-semibold text-muted [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none">
          ▸
        </span>
        How to read this
      </summary>
      <div className="mt-2 space-y-2 text-muted">{children}</div>
    </details>
  );
}
