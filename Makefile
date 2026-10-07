.PHONY: openapi setup dev migrate load-history test test-e2e lint fmt train-stage2 evaluate backtest tune-alerts
setup:        ; cd backend && uv sync && cd ../web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile
dev:          ; docker compose up --build
migrate:      ; cd backend && uv run alembic upgrade head
load-history: ; cd backend && uv run python -m app.ingest.history
test:         ; cd backend && uv run pytest && cd ../web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm test
test-e2e:     ; cd web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm test:e2e
lint:         ; cd backend && uv run ruff check . ../ml && uv run ruff format --check . ../ml && uv run pyright app ../ml && cd ../web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm typecheck
openapi:      ; cd backend && uv run python -m app.export_openapi ../web/lib/api/openapi.json && cd ../web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec openapi-typescript lib/api/openapi.json -o lib/api/schema.d.ts
fmt:          ; cd backend && uv run ruff format . ../ml
train-stage2: ; cd backend && PYTHONPATH=.. uv run python -m ml.train_stage2 --config ml/configs/stage2.yaml
evaluate:     ; cd backend && PYTHONPATH=.. uv run python -m ml.evaluate --config ml/configs/stage2.yaml
STORM ?= 2024-05-gannon
backtest:     ; cd backend && PYTHONPATH=.. uv run python -m ml.backtest --config ml/configs/stage2.yaml --storm $(STORM)
tune-alerts:  ; cd backend && PYTHONPATH=.. uv run python -m ml.alert_tuning --config ml/configs/stage2.yaml
