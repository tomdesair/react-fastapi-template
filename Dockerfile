FROM node:23-alpine AS frontend-builder

WORKDIR /app/frontend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm install

COPY frontend/ ./

RUN pnpm build

FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS backend-builder

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-dev

FROM unit:python3.13-slim AS runtime

WORKDIR /app

COPY --from=backend-builder --chown=app:app /app/.venv /venv

COPY --from=frontend-builder /app/frontend/dist ./frontend

COPY backend/ ./backend

ENV PATH="/venv/bin:$PATH"

COPY unit.json /docker-entrypoint.d/config.json

HEALTHCHECK --interval=5s --timeout=3s CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1/api/health/ready', timeout=3)"]
