# AI Agent Guide

## Start of every conversation

Always read this full file and the full `README.md` before inspecting code,
making changes, or running commands. Treat this file as the repository's
operational guide and keep it consistent with the README and current project
configuration.

## Architecture

This project is one full-stack application deployed as one NGINX Unit
container:

- `frontend/` contains the React 19 and TypeScript application.
- `backend/` contains the FastAPI application and Python package.
- `unit.json` routes `/api/*` requests to `backend.server:app` and serves the
  compiled frontend for every other request.
- The frontend and backend share an origin in production, so frontend API calls
  use relative `/api/...` URLs without CORS configuration.
- During local development, Vite runs on port 5173 and proxies `/api` to the
  FastAPI development server on port 8000.
- `Dockerfile` builds the frontend with pnpm, installs backend dependencies
  with uv, and combines the static bundle and Python application in the Unit
  runtime image.

## Technology and tooling

- Python 3.13+ with FastAPI, Pydantic, and Uvicorn.
- uv manages Python dependencies and the committed `uv.lock` file.
- React 19, TypeScript, Vite, Tailwind CSS, and shadcn/ui power the frontend.
- pnpm manages Node dependencies and the committed `pnpm-lock.yaml` file.
- Backend tests use pytest and FastAPI's HTTPX-backed `TestClient`.
- Frontend tests use Vitest, jsdom, and React Testing Library.
- `just` is the public command interface for installation, development,
  testing, builds, and production-container startup.
- Docker and NGINX Unit provide the production deployment.

## Working conventions

- Keep backend code and tests under `backend/`.
- Keep React source, assets, shadcn components, and frontend tests under
  `frontend/`.
- Use `@/` imports for frontend modules beneath `frontend/`.
- Preserve the `/api` prefix for FastAPI routes and relative frontend API calls.
- Keep local development, Unit routing, Docker paths, and documentation in
  sync when moving or adding application entry points.
- Add backend development dependencies to the `dev` dependency group in
  `pyproject.toml` with uv. Add frontend development dependencies with pnpm.
- Commit dependency-lock updates together with manifest changes.
- When a new technology, runtime, library, service, or major tool is added,
  update this `AGENTS.md` file in the same change, including its purpose and
  any agent-relevant commands or constraints.

## Commands

Run commands from the repository root:

- `just install` installs both dependency sets.
- `just develop backend` starts FastAPI with reload.
- `just develop frontend` starts Vite with hot reload.
- `just test backend` runs the backend pytest suite.
- `just test frontend` runs the frontend Vitest suite.
- `just build` builds the complete production container.
- `just start` runs that container on port 8080 by default.

The direct production checks for each side are `uv sync --locked --no-dev` for
the backend and `pnpm run build` for the frontend. Use the smallest relevant
test or build command while developing, then run both sides' checks when
shared configuration or the container layout changes.
