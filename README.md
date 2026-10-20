# SolarBud

Geomagnetic storm forecasts and alerts. Not an official forecast — see https://www.swpc.noaa.gov.

**Live dashboard:** https://solarbud-hkk-189s-projects.vercel.app (the API runs on the owner's own machine, so the data can be offline when that machine is).

## What it shows

- **Overview:** a one-sentence storm status, a storm ruler (Kp on NOAA's G scale with the likely value and range for now, +1, +3 and +6 h), the Kp forecast with its uncertainty, and the last 24 hours of solar wind. Everything refreshes every 5 minutes.
- **Aurora:** a world map of how far towards the equator the aurora may be seen, plus a check-a-place control.
- **GNSS:** a Low / Moderate / High / Severe risk for GPS and RTK work over the next 6 hours.
- **Models:** how accurate the forecasts are, and how the last 48 hours of forecasts compared with the Kp that was then measured.
- **Backtests:** the alert engine replayed on five major storms the model never saw.
- **API docs:** the public JSON API, generated from its OpenAPI description.

A CME tracker is planned. The alert engine runs as a dry run (nothing is sent yet); a Telegram bot comes later.

## Run it locally

```bash
cp .env.example .env
make setup                 # uv sync + web install
docker compose up -d       # postgres, api, worker (needs artefacts/*.joblib)
cd web && corepack pnpm dev    # http://localhost:3000
make lint && make test     # must pass before any commit
```

`make test-e2e` runs the Playwright suite against an unreachable API, so stop `pnpm dev` first.

## Layout

- `backend/` FastAPI API, SWPC ingest, quality checks, features, alert engine and the scheduled worker.
- `ml/` training, evaluation, storm replay and alert tuning.
- `web/` the Next.js dashboard (design rules in `web/DESIGN.md`).
- `ops/` small standard-library scripts that keep the demo online: they re-point the web app at the API's tunnel after every restart, and check from outside that the public forecast is fresh.

## Stage 2 status

LightGBM quantile Kp forecasts (+1/+3/+6 h) from real-time L1 solar wind, trained with a 6x sample weight on storm-level (Kp ≥ 5-) rows. On the held-out storms plus the 2025+ test block:

| Horizon | RMSE skill vs persistence | Kp ≥ 5 TSS (persistence) | 80% interval coverage |
|---|---|---|---|
| +1 h | +0.25 | 0.69 (0.50) | 0.80 |
| +3 h | +0.18 | 0.59 (0.44) | 0.82 |
| +6 h | +0.14 | 0.47 (0.35) | 0.84 |

Kp ≥ 7 detection is still weak at +3 h and +6 h, and the intervals are too narrow during the largest storms. Training is reproducible with `make train-stage2`; `make evaluate` regenerates the metrics.

## Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md).
