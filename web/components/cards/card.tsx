import { Explainer } from "./explainer";
import type { Explanation } from "@/lib/explanations";

export function Card({ title, children, explain }: { title: string; children: React.ReactNode; explain?: Explanation }) {
  return (
    <section className="rounded-card border border-outline bg-card p-6 shadow-[var(--shadow-subtle)]">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {explain && <Explainer explain={explain} />}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
