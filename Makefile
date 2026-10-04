.PHONY: setup dev migrate load-history test lint fmt train-stage2 evaluate
setup:        ; cd backend && uv sync
dev:          ; docker compose up --build
migrate:      ; cd backend && uv run alembic upgrade head
load-history: ; cd backend && uv run python -m app.ingest.history
test:         ; cd backend && uv run pytest
lint:         ; cd backend && uv run ruff check . ../ml && uv run ruff format --check . ../ml && uv run pyright app ../ml
fmt:          ; cd backend && uv run ruff format . ../ml
train-stage2: ; cd backend && uv run python ../ml/train_stage2.py --config ../ml/configs/stage2.yaml
evaluate:     ; cd backend && uv run python ../ml/evaluate.py --config ../ml/configs/stage2.yaml
