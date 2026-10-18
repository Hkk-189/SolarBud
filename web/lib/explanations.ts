export interface Explanation {
  summary: string;
  details: string[];
}

export const EXPLAIN: Record<"stormLevel" | "kpForecast" | "solarWindNow" | "kpChart" | "solarWindCharts" | "aurora" | "gnss" | "verification", Explanation> = {
  stormLevel: {
    summary:
      "Where Earth's magnetic field is now and is forecast to be over the next 6 hours, on NOAA's scale from G0 (quiet) to G5 (extreme).",
    details: [
      "A storm starts at G1, which is Kp 5- (about 4.7) or more. Each step up is a stronger storm.",
      "Storms can reduce GPS accuracy and disturb radio and power grids, and they push the aurora closer to the equator.",
      "Warning means the forecast showed a G1 or stronger storm as likely within 6 hours; Active means one is happening now; All clear means the storm or the warning is over.",
      "Each dot is the likely value and the orange bar the range we expect it to fall in. A warning looks 6 hours ahead, so it can appear while the dots are still in G0.",
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
  aurora: {
    summary: "The lower the latitude in the table, the further towards the equator the aurora may be seen.",
    details: [
      "Kp 5 puts the aurora's edge near 56° geomagnetic latitude, Kp 7 near 52° and Kp 9 near 47°. Between those values we interpolate.",
      "Likely uses the middle forecast; Could reach uses the high end of the range, which a strong storm can exceed.",
      "The map draws that edge across the world. It is tilted because geomagnetic latitude is measured from the magnetic pole (about 80.9°N, 72.8°W), not the geographic one.",
      "This is a rough rule from Kp alone. It is not an official forecast.",
    ],
  },
  gnss: {
    summary: "Risk is read from the forecast storm level: Low below G1, Moderate for G1 and G2, High for G3, Severe for G4 and G5.",
    details: [
      "Storms disturb the ionosphere, which can degrade GPS accuracy and RTK fixes.",
      "Risk uses the likely Kp; Could reach uses the high end of the range.",
      "This is a simple rule from the storm level, not a measurement of the ionosphere.",
    ],
  },
  verification: {
    summary:
      "Each point is a forecast made 3 hours before a 3-hour period began. The grey steps are the Kp measured for that period afterwards.",
    details: [
      "The orange band is the range we expected: about 8 times in 10 the measured value should land inside it.",
      "Only periods that have finished are shown, and a gap means no forecast was issued then, for example while the worker was off.",
      "In big storms the measured value often ends up above the band.",
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
  "cme",
  { title: string; body: string; phase: string }
> = {
  cme: {
    title: "CME tracker",
    body: "Solar eruptions (CMEs) heading towards Earth and when they are predicted to arrive.",
    phase: "Phase 3",
  },
};
