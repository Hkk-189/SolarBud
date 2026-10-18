import { HowToRead } from "@/components/cards/how-to-read";
import type { AlertKind, Backtest } from "@/lib/backtests";

const W = 1000;

const DAY = 86_400_000;

/** Maps a time onto 0..1000, clamped to the drawn range. */
export function timelineX(t: number, t0: number, t1: number): number {
  return Math.round(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) * W);
}

function Mark({ kind, x, y = 46 }: { kind: AlertKind; x: number; y?: number }) {
  if (kind === "warning") return <path d={`M${x} ${y - 9}L${x + 8} ${y + 6}L${x - 8} ${y + 6}Z`} fill="var(--surface-elevated)" stroke="currentColor" strokeWidth="2" />;

  if (kind === "active") return <circle cx={x} cy={y} r="7" fill="currentColor" />;

  return <rect x={x - 6} y={y - 6} width="12" height="12" fill="var(--surface-elevated)" stroke="currentColor" strokeWidth="2" />;
}

/** Alert events on a line, with the held-out storm dates shaded. Shapes differ, so colour carries no meaning. */
export function StormTimeline({ storm }: { storm: Backtest }) {
  const stormStart = Date.parse(storm.start);
  const stormEnd = Date.parse(storm.end) + DAY;
  const times = storm.events.map((e) => Date.parse(e.at));
  const t0 = Math.min(stormStart, ...times) - DAY / 4;
  const t1 = Math.max(stormEnd, ...times) + DAY / 4;
  const x = (t: number) => timelineX(t, t0, t1);
  const days = Array.from({ length: Math.ceil((t1 - t0) / DAY) + 1 }, (_, i) => Math.ceil(t0 / DAY) * DAY + i * DAY).filter((t) => t < t1);
  const step = Math.ceil(days.length / 8);

  return (
    <svg
      role="img"
      aria-label={`${storm.name} timeline: ${storm.events.length} alert events; storm dates ${storm.start} to ${storm.end} shaded`}
      viewBox={`0 0 ${W} 84`}
      className="w-full min-w-[640px] text-foreground"
    >
      <rect x={x(stormStart)} y="10" width={x(stormEnd) - x(stormStart)} height="52" fill="var(--surface-soft)" stroke="var(--outline-strong)" />
      <line x1="0" x2={W} y1="46" y2="46" stroke="var(--outline-strong)" strokeWidth="2" />
      {days.map((t, i) =>
        i % step === 0 ? (
          <text key={t} x={x(t)} y="80" textAnchor="middle" fontSize="13" fill="var(--muted)">
            {new Date(t).toISOString().slice(5, 10)}
          </text>
        ) : null,
      )}
      {storm.events.map((e) => (
        <Mark key={`${e.kind}${e.at}`} kind={e.kind} x={x(Date.parse(e.at))} />
      ))}
    </svg>
  );
}

const LEGEND: { kind: AlertKind; term: string; text: string }[] = [
  { kind: "warning", term: "Warning", text: "a G1 or stronger storm is likely within 6 hours." },
  { kind: "active", term: "Active", text: "a storm is under way." },
  { kind: "all_clear", term: "All clear", text: "the storm or the warning is over." },
];

/** Key for every timeline on the page; draws the same marks the charts use. */
export function TimelineLegend() {
  return (
    <HowToRead>
      <p className="flex items-center gap-2">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
          <rect x="1" y="5" width="22" height="14" fill="var(--surface-soft)" stroke="var(--outline-strong)" />
        </svg>
        <span>Storm dates: the shaded box, from the start of the first day to the end of the last.</span>
      </p>
      {LEGEND.map(({ kind, term, text }) => (
        <p key={kind} className="flex items-center gap-2">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-foreground">
            <Mark kind={kind} x={12} y={13} />
          </svg>
          <span>
            {term}: {text}
          </span>
        </p>
      ))}
      <p>A Warning with no Active after it is a false warning. All times and dates are UTC. Nothing was sent; these are dry runs.</p>
    </HowToRead>
  );
}
