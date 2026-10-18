import type { Metadata } from "next";
import { VerificationChart } from "@/components/charts/verification-chart";
import { getVerification } from "@/lib/api/client";
import { COVERAGE, MODEL_LABEL, SCORES } from "@/lib/model-card";

export const metadata: Metadata = { title: "Models" };

const pct = (v: number) => `${Math.round(v * 100)}%`;

const lgbm = SCORES.filter((r) => r.model === "lgbm-p50");

const pod7 = (h: number) => pct(lgbm.find((r) => r.horizon === h)?.pod7 ?? 0);

const signed = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`;

export default async function Models() {
  const verification = await getVerification();

  return (
    <div className="space-y-6">
      <header className="max-w-prose space-y-2">
        <h1 className="text-2xl font-bold">Models</h1>
        <p className="text-base">
          SolarBud forecasts Kp 1, 3 and 6 hours ahead with LightGBM, a decision-tree model. It reads the last 8 hours of
          solar wind measured at L1 and predicts a likely value plus a range (p10 to p90).
        </p>
      </header>

      <section className="rounded-card border border-outline bg-card p-6">
        <h2 className="text-[0.95rem] font-semibold">How accurate is it?</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Scored on data the model never trained on: five major storms and everything from 2025 onward. Skill is the
          error reduction compared with persistence, which just repeats the latest Kp (higher is better). Hit rate is
          the share of Kp 5- or higher storm readings the model flagged; false alarms are the share of its storm calls
          that were wrong.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
            <caption className="sr-only">Scores on held-out data, by forecast horizon and model</caption>
            <thead>
              <tr className="bg-primary/5 text-xs font-semibold text-primary-fill-hover">
                <th className="h-12 px-2">Horizon</th>
                <th className="px-2">Model</th>
                <th className="px-2">Error (RMSE)</th>
                <th className="px-2">Skill</th>
                <th className="px-2">Storm hit rate</th>
                <th className="px-2">False alarms</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {SCORES.map((r) => (
                <tr key={`${r.horizon}${r.model}`} className={`border-t border-outline ${r.model === "lgbm-p50" ? "font-semibold text-foreground" : ""}`}>
                  <td className="p-2">+{r.horizon} h</td>
                  <td className="p-2">{MODEL_LABEL[r.model]}</td>
                  <td className="p-2">{r.rmse.toFixed(3)}</td>
                  <td className="p-2">{signed(r.skill)}</td>
                  <td className="p-2">{pct(r.pod5)}</td>
                  <td className="p-2">{pct(r.far5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <VerificationChart initial={verification.ok ? verification.data : null} />

      <section className="rounded-card border border-outline bg-card p-6">
        <h2 className="text-[0.95rem] font-semibold">What it can&apos;t do yet</h2>
        <ul className="mt-2 max-w-prose list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            Very strong storms (Kp 7 or more) are caught only {pod7(3)} of the time at +3 h and {pod7(6)} at +6 h. Do not rely on
            the forecast to rule one out.
          </li>
          <li>
            The range is right about 8 times in 10 ({pct(COVERAGE[1])}, {pct(COVERAGE[3])} and {pct(COVERAGE[6])} at +1,
            +3 and +6 h), but in big storms the real value often ends up above it.
          </li>
          <li>
            At +3 and +6 h about half the storm calls are false alarms, which is why alerts need a sustained signal
            before a Warning goes out.
          </li>
          <li>
            It only sees the solar wind at L1, so it cannot see an eruption on the Sun until the plasma arrives, 15 to 90
            minutes before Earth.
          </li>
        </ul>
      </section>
    </div>
  );
}
