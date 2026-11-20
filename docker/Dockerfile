FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

RUN npm install --global pnpm@12.21.0

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY frontend/ ./

RUN pnpm build

FROM ghcr.io/astral-sh/uv:0.13.9 AS uv

FROM docker.io/python:3.15-alpine AS backend-builder

COPY --from=uv /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-dev

FROM docker.io/python:3.15-alpine AS runtime

WORKDIR /app

# The default SQLite database is created in /app, so the non-root runtime account
# owns that directory without needing write access to any other image location.
RUN useradd --create-home --uid 10001 app && chown app:app /app

COPY --from=backend-builder /app/.venv /venv

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

COPY backend/ ./backend
COPY docker/start.sh ./start.sh
COPY alembic.ini ./alembic.ini

ENV PATH="/venv/bin:$PATH"

USER app

EXPOSE 8000

CMD ["bash", "/app/start.sh"]

HEALTHCHECK --interval=5s --timeout=3s CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health/ready', timeout=3)"]
