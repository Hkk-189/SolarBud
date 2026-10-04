# SolarBud

Geomagnetic storm forecasting and alerts. Not an official forecast — see https://www.swpc.noaa.gov.

```bash
cp .env.example .env
make setup
make test
```

## Stage 2 status

LightGBM quantile Kp forecasts (+1/+3/+6 h) beat persistence on RMSE (+3 h skill +0.24), with 80% interval coverage 0.81–0.82. Storm-event skill (TSS at Kp≥5) matches persistence at +1 h but trails it at +3/+6 h overall; see the full table and per-storm breakdown in [docs/model-cards/stage2-lgbm.md](docs/model-cards/stage2-lgbm.md).

See `AGENTS.md`, `docs/PRD.md` and `docs/context.md`.
