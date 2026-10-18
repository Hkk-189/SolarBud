import type { KpForecast, KpPoint } from "@/lib/api/client";
import { HowToRead } from "@/components/cards/how-to-read";
import { kpRuler, type RulerLane } from "@/lib/kp-ruler";

const pct = (kp: number) => `${(kp / 9) * 100}%`;

const TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Same inset on every track so ticks, bands and marks share one scale.
const TRACK = "relative ml-3 mr-6 md:mx-4";

const ROW = "grid gap-x-4 md:grid-cols-[4.5rem_1fr] md:items-center";

function Dot({ kp }: { kp: number }) {
  return (
    <span
      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
      style={{ left: pct(kp) }}
    />
  );
}

function Whisker({ lane }: { lane: RulerLane }) {
  const { p10, p50, p90 } = lane;

  if (p10 === undefined || p90 === undefined || p50 === null) return null;

  const span = p90 - p10;
  const origin = span === 0 ? 50 : ((p50 - p10) / span) * 100;

  return (
    <span
      className="ruler-whisker absolute top-1/2 h-3.5 -translate-y-1/2 border-x-[3px] border-uncertainty"
      style={{ left: pct(p10), width: pct(span), transformOrigin: `${origin}% 50%` }}
    >
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-uncertainty" />
    </span>
  );
}

function Lane({ lane }: { lane: RulerLane }) {
  return (
    <div className={`${ROW} mt-2 md:mt-1`}>
      <div className="flex items-baseline gap-2 text-sm">
        <span>{lane.label}</span>
        {lane.p50 !== null && <span className="tabular-nums text-muted">{lane.p50.toFixed(1)}</span>}
      </div>
      <div className={`${TRACK} h-6`}>
        <span className="absolute inset-x-0 top-1/2 h-px bg-outline" />
        {lane.p50 === null ? (
          <span className="absolute inset-y-0 left-0 flex items-center text-sm text-muted">
            {lane.kind === "observed" ? "no recent observation" : "no forecast"}
          </span>
        ) : (
          <>
            <Whisker lane={lane} />
            <Dot kp={lane.p50} />
          </>
        )}
      </div>
    </div>
  );
}

function RulerLegend() {
  return (
    <HowToRead>
      <p className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block size-3.5 shrink-0 rounded-full bg-foreground" />
        <span>Likely Kp: our best single estimate for that time.</span>
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden="true" className="relative inline-block h-3.5 w-8 shrink-0 border-x-[3px] border-uncertainty">
          <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-uncertainty" />
        </span>
        <span>Likely range, from Low to High: the real value falls inside it about 8 times out of 10.</span>
      </p>
      <p>Now is the latest measured Kp. In 1, 3 and 6 h are forecasts from the time shown on the Kp forecast card.</p>
      <p>The coloured strip is NOAA&apos;s storm scale, G0 (quiet) to G5 (extreme). A storm starts at G1, which is Kp 5- (about 4.7).</p>
    </HowToRead>
  );
}

export function StormRuler({
  forecast,
  observed,
  nowMs,
}: {
  forecast: KpForecast | null;
  observed: KpPoint[] | null;
  nowMs: number;
}) {
  const { bands, lanes, issuedNote } = kpRuler(forecast, observed, nowMs);
  const label = `Kp scale from 0 to 9 with NOAA storm bands G0 to G5. ${lanes.map((l) => l.text).join(". ")}.${issuedNote ? ` ${issuedNote}` : ""}`;

  return (
    <div className="w-full">
    <div role="img" aria-label={label} className="w-full">
      <div aria-hidden="true">
        <div className={ROW}>
          <span />
          <div className={`${TRACK} h-6`}>
            {TICKS.map((k) => (
              <span
                key={k}
                className="absolute top-0 -translate-x-1/2 text-xs tabular-nums text-muted"
                style={{ left: pct(k) }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className={ROW}>
          <span className="hidden md:block text-sm text-muted">Kp</span>
          <div className={`${TRACK} flex h-9`}>
            {bands.map((b) => (
              <span
                key={b.g}
                className="relative flex items-center justify-center whitespace-nowrap text-[0.6875rem] font-semibold md:text-sm"
                style={{
                  width: pct(b.to - b.from),
                  backgroundColor: `var(--g${b.g}-bg)`,
                  color: `var(--g${b.g}-fg)`,
                }}
              >
                {/* G5 is under 4% wide: below lg its label sits just right of the strip. */}
                <span className={b.g === 5 ? "max-lg:absolute max-lg:left-full max-lg:pl-1 max-lg:text-foreground" : ""}>
                  G{b.g}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2">
          {lanes.map((l) => (
            <Lane key={l.label} lane={l} />
          ))}
        </div>
        {issuedNote && <p className="mt-2 text-sm text-muted">{issuedNote}</p>}
      </div>
    </div>
    <RulerLegend />
    </div>
  );
}
