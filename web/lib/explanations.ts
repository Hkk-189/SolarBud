export interface Explanation {
  summary: string;
  details: string[];
}

export const EXPLAIN: Record<"stormLevel" | "kpForecast" | "solarWindNow" | "kpChart" | "solarWindCharts", Explanation> = {
  stormLevel: {
    summary:
      "How disturbed Earth's magnetic field is expected to be in the next hour, on NOAA's scale from G0 (quiet) to G5 (extreme).",
    details: [
      "A storm starts at G1, which is Kp 5- (about 4.7) or more. Each step up is a stronger storm.",
      "Storms can reduce GPS accuracy and disturb radio and power grids, and they push the aurora closer to the equator.",
      "Warning means the forecast showed a G1 or stronger storm as likely within 6 hours; Active means one is happening now; All clear means the storm or the warning is over.",
      "The badge shows the next hour; a Warning looks 6 hours ahead, so a Warning can appear next to G0.",
      "From India, the aurora is visible only in extreme storms, such as the one seen from Ladakh in May 2024.",
    ],
  },
  kpForecast: {
    summary: "Kp measures geomagnetic activity from 0 to 9. Each row forecasts Kp 1, 3 and 6 hours after the issue time.",
    details: [
      "Likely is the middle estimate. Low and High mark the range we expect the real value to fall in about 8 times out of 10.",
      "In big storms the real value often ends up above High, so High is not a ceiling.",
      "Kp 5- (about 4.7) or more is a storm (G1 or higher).",
    ],
  },
  solarWindNow: {
    summary:
      "The solar wind measured about 1.5 million km towards the Sun, at the L1 point. It reaches Earth 15 to 90 minutes later.",
    details: [
      "Speed: usually 300 to 500 km/s; much faster wind often comes before a storm.",
      "Density: how many particles per cubic centimetre, usually about 5.",
      "Bz: the north-south direction of the magnetic field the wind carries. Strongly negative (southward) Bz lasting hours is the main storm driver.",
      "Bt: the total strength of that field, usually about 5 nT.",
    ],
  },
  kpChart: {
    summary:
      "Observed Kp for the last day, then the forecast: the line is the likely value and the shaded band the likely range.",
    details: [
      "The dashed line is G1 (Kp 5-), where a storm starts.",
      "'now' marks when the forecast was issued. 'last forecast' means no new forecast has arrived for over 15 minutes.",
    ],
  },
  solarWindCharts: {
    summary:
      "The last 24 hours of solar wind at L1. A sudden jump in speed, density and field strength often means a solar eruption (a CME) has arrived.",
    details: [
      "Watch Bz: long stretches of strongly negative Bz are what turn a fast wind into a storm.",
      "Gaps mean no valid data reached SolarBud for those minutes.",
    ],
  },
};

export const COMING_SOON: Record<
  "aurora" | "gnss" | "cme" | "backtest" | "models" | "api-docs",
  { title: string; body: string; phase: string }
> = {
  aurora: {
    title: "Aurora",
    body: "When and where the aurora may be visible, based on the Kp forecast, with honest odds for low latitudes like India.",
    phase: "Phase 4",
  },
  gnss: {
    title: "GNSS",
    body: "A Low, Moderate, High or Severe risk timeline for GPS and RTK work over the next 3 days, with plain advice.",
    phase: "Phase 4",
  },
  cme: {
    title: "CME tracker",
    body: "Solar eruptions (CMEs) heading towards Earth and when they are predicted to arrive.",
    phase: "Phase 3",
  },
  backtest: {
    title: "Backtests",
    body: "How SolarBud's forecasts and alerts performed on five well-known past storms.",
    phase: "Phase 4",
  },
  models: {
    title: "Models",
    body: "What the forecast model is, how it was trained and how accurate it is.",
    phase: "Phase 4",
  },
  "api-docs": {
    title: "API docs",
    body: "How to fetch SolarBud's forecasts from its public API.",
    phase: "Phase 4",
  },
};
