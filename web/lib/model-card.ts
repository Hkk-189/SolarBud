// Test-split scores from docs/model-cards/stage2-lgbm.md (`make evaluate`): the five held-out storms
// plus 2025 onward. Regenerate this table whenever the model card changes.
type ModelId = "persistence" | "newell-kp" | "lgbm-p50";

export const MODEL_LABEL: Record<ModelId, string> = {
  persistence: "Persistence (next value = last value)",
  "newell-kp": "Newell coupling formula",
  "lgbm-p50": "SolarBud (LightGBM, likely value)",
};

interface ScoreRow {
  horizon: 1 | 3 | 6;
  model: ModelId;
  rmse: number;
  skill: number;
  pod5: number;
  far5: number;
  pod7: number;
}

export const SCORES: ScoreRow[] = [
  { horizon: 1, model: "persistence", rmse: 1.003, skill: 0, pod5: 0.54, far5: 0.45, pod7: 0.55 },
  { horizon: 1, model: "newell-kp", rmse: 1.185, skill: -0.181, pod5: 0.38, far5: 0.2, pod7: 0.6 },
  { horizon: 1, model: "lgbm-p50", rmse: 0.753, skill: 0.25, pod5: 0.74, far5: 0.42, pod7: 0.54 },
  { horizon: 3, model: "persistence", rmse: 1.169, skill: 0, pod5: 0.48, far5: 0.51, pod7: 0.47 },
  { horizon: 3, model: "newell-kp", rmse: 1.256, skill: -0.074, pod5: 0.26, far5: 0.22, pod7: 0.46 },
  { horizon: 3, model: "lgbm-p50", rmse: 0.963, skill: 0.177, pod5: 0.65, far5: 0.51, pod7: 0.33 },
  { horizon: 6, model: "persistence", rmse: 1.327, skill: 0, pod5: 0.4, far5: 0.59, pod7: 0.36 },
  { horizon: 6, model: "newell-kp", rmse: 1.334, skill: -0.005, pod5: 0.16, far5: 0.25, pod7: 0.34 },
  { horizon: 6, model: "lgbm-p50", rmse: 1.136, skill: 0.144, pod5: 0.53, far5: 0.57, pod7: 0.05 },
];

/** Share of real Kp values that land inside the 80% range (p10 to p90), per horizon. */
export const COVERAGE: Record<1 | 3 | 6, number> = { 1: 0.8, 3: 0.82, 6: 0.84 };
