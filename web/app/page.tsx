import { GLevelBadge } from "@/components/cards/g-level-badge";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-outline bg-card p-6 shadow-[var(--shadow-subtle)]">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const WAITING = <p className="text-sm text-muted">Waiting for the API. No data yet.</p>;

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Space weather now</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Storm level">
          <GLevelBadge kp={Number.NaN} />
        </Card>
        <Card title="Kp forecast (+1, +3, +6 h)">{WAITING}</Card>
        <Card title="Solar wind (L1)">{WAITING}</Card>
      </div>
    </div>
  );
}
