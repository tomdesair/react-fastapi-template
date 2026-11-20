FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

RUN npm install --global pnpm@12.21.0

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

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

# The application creates its default SQLite database in /app, so the Unit
# process must own that directory while the rest of the image remains root-owned.
RUN chown unit:unit /app

# Unit's official image provides the `unit` account for application ownership.
COPY --from=backend-builder --chown=unit:unit /app/.venv /venv

COPY --from=frontend-builder /app/frontend/dist ./frontend

COPY backend/ ./backend

ENV PATH="/venv/bin:$PATH"

COPY unit.json /docker-entrypoint.d/config.json

HEALTHCHECK --interval=5s --timeout=3s CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1/api/health/ready', timeout=3)"]
