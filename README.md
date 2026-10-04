# SolarBud

Geomagnetic storm forecasting and alerts. Not an official forecast — see https://www.swpc.noaa.gov.

```bash
cp .env.example .env
make setup
make test
```

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
