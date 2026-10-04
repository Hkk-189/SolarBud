.PHONY: setup dev migrate load-history test lint fmt train-stage2 evaluate backtest
setup:        ; cd backend && uv sync
dev:          ; docker compose up --build
migrate:      ; cd backend && uv run alembic upgrade head
load-history: ; cd backend && uv run python -m app.ingest.history
test:         ; cd backend && uv run pytest
lint:         ; cd backend && uv run ruff check . ../ml && uv run ruff format --check . ../ml && uv run pyright app ../ml
fmt:          ; cd backend && uv run ruff format . ../ml
train-stage2: ; cd backend && PYTHONPATH=.. uv run python -m ml.train_stage2 --config ml/configs/stage2.yaml
evaluate:     ; cd backend && PYTHONPATH=.. uv run python -m ml.evaluate --config ml/configs/stage2.yaml
backtest:     ; cd backend && PYTHONPATH=.. uv run python -m ml.backtest --storm $(STORM)
