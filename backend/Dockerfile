FROM python:3.12-slim
RUN pip install uv
WORKDIR /app
COPY pyproject.toml ./
RUN uv sync --no-dev
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
