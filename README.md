# React + FastAPI Template

A modern full-stack template featuring React for the frontend and FastAPI for
the backend, bundled together in a single container using NGINX Unit.

[Check out the tutorial blog!](https://ajac-zero.com/posts/building-react-fastapi-app-with-nginx-unit/)

## Features

- **React frontend**
  - React 19 and TypeScript
  - TanStack Query for API caching and mutations
  - Dependency-free honeycomb color picker
  - Tailwind CSS and shadcn/ui components
  - Fast refresh during development
  - Optimized production build
- **FastAPI backend**
  - Python type hints and Pydantic models
  - SQLAlchemy-backed SQLite persistence
  - OpenAPI/Swagger documentation
  - Kubernetes liveness and readiness endpoints
- **Testing**
  - pytest and FastAPI `TestClient` for the backend
  - Vitest, jsdom, and React Testing Library for the frontend
- **Production ready**
  - Single-container deployment with NGINX Unit
  - Multi-stage Docker build
  - Readiness-based Docker health check
  - Static file serving and efficient dependency caching

## Prerequisites

- [Node.js](https://nodejs.org/) 24 LTS or newer
- [pnpm](https://pnpm.io/installation) 12 or newer
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [just](https://github.com/casey/just)
- [Docker](https://www.docker.com/) or [Podman](https://podman.io/) for the
  production container commands

Install Node.js with the installer for your operating system, or with your
preferred version manager. The remaining tools can be installed on macOS and
Linux with:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install rust-just
```

On Windows, use PowerShell:

```powershell
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv tool install rust-just
```

Restart the shell after installation, then confirm the tools are available:

```bash
node --version
pnpm --version
uv --version
just --version
```

Python does not need to be installed separately. uv reads `.python-version` and
installs the required Python 3.13 release when dependencies are synchronized.
A container engine is only required for the production commands.

## Install

Install frontend and backend dependencies:

```bash
just install
```

The frontend is a self-contained pnpm project under `frontend/`; the backend is
managed from the repository root by uv. The `just` recipes keep these separate
tooling contexts behind one public command interface.

## Development

The frontend and backend run independently during development. Start them in
separate terminals:

```bash
just develop backend
just develop frontend
```

The FastAPI server runs at `http://localhost:8000`, with documentation at
`http://localhost:8000/api/docs`. Vite runs at `http://localhost:5173` and
proxies `/api` requests to FastAPI.

Backend settings are validated by Pydantic Settings. Copy `.env.example` to
`.env` for local overrides:

```bash
cp .env.example .env
```

`DATABASE_URL` can be set in `.env` or in the process environment. Process
environment variables take precedence over `.env`; the default remains
`sqlite:///./database.db`. The `.env` file is ignored by Git.

## Code quality

Format all backend and frontend code:

```bash
just format
```

Install the pre-commit hook, then optionally run all checks manually:

```bash
uv run pre-commit install
uv run pre-commit run --all-files
```

The checks use Ruff for Python, and Prettier plus ESLint for the frontend.

## Continuous integration

GitHub Actions runs `.github/workflows/ci.yml` for every push and pull request.
The workflow checks Python and frontend formatting and linting, runs all backend
and frontend tests, and builds the production container image with Docker
Buildx. The image is built for validation only and is not pushed to a registry.

## Testing

Run either suite by target:

```bash
just test backend
just test frontend
```

The tests cover persistent counters, health endpoints, duplicate color handling,
and the React UI's create, increment, and delete flows.

## Production

Build and run the production container:

```bash
just build
just start
```

The application is available at `http://localhost:8080` by default:

- Frontend static files are served directly by NGINX Unit.
- `/api/*` requests are routed to the FastAPI application.
- API documentation is available at `http://localhost:8080/api/docs`.
- `/api/health/alive` reports whether FastAPI is running.
- `/api/health/ready` verifies that the configured database can execute a
  query.

The default database is `database.db` in the working directory. Set
`DATABASE_URL` in the environment or `.env` to use a different SQLAlchemy
database URL. SQLite database files are excluded from version control.

Pass a different host port to `just start`, for example `just start 3000`.
The recipes use Docker when available and otherwise fall back to Podman. Set
`CONTAINER_ENGINE=podman` or `CONTAINER_ENGINE=docker` to choose an engine when
both are installed, for example:

```bash
CONTAINER_ENGINE=podman just build
CONTAINER_ENGINE=podman just start
```

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml       # Formatting, linting, tests, and container build
├── backend/               # FastAPI backend
│   ├── counters/          # Counter model, Pydantic schemas, and routes
│   │   ├── models.py
│   │   ├── router.py
│   │   └── schemas.py
│   ├── health/            # Liveness and readiness routes
│   │   └── router.py
│   ├── tests/             # Backend tests grouped by API feature
│   │   ├── health/
│   │   └── test_counters.py
│   ├── __init__.py
│   ├── config.py          # Typed settings and configuration fallbacks
│   ├── database.py        # SQLAlchemy engine, sessions, base, and startup
│   └── server.py          # FastAPI composition and application lifecycle
├── frontend/              # React frontend
│   ├── assets/
│   ├── components/        # Feature components and shadcn/ui primitives
│   │   ├── app/
│   │   │   ├── app.css
│   │   │   └── index.tsx
│   │   ├── counters/
│   │   │   ├── counter-card/
│   │   │   │   └── index.tsx
│   │   │   └── honeycomb-color-picker/
│   │   │       ├── honeycomb-color-picker.css
│   │   │       └── index.tsx
│   │   └── ui/
│   │       └── button/
│   │           └── index.tsx
│   ├── lib/
│   ├── services/          # Typed HTTP clients and Query keys
│   ├── tests/
│   │   ├── components/    # Tests mirror the components/ hierarchy
│   │   │   ├── app/
│   │   │   │   └── index.test.tsx
│   │   │   └── counters/
│   │   │       ├── counter-card/
│   │   │       │   └── index.test.tsx
│   │   │       └── honeycomb-color-picker/
│   │   │           └── index.test.tsx
│   │   └── services/
│   │       └── counters.test.ts
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.css          # Tailwind imports and global theme/base styles
│   ├── index.html
│   ├── main.tsx
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── AGENTS.md              # Guidance for AI agents
├── .env.example           # Safe local configuration template
├── .python-version        # Python runtime selected by uv
├── Dockerfile             # Multi-stage production build
├── Justfile               # Development, test, and build commands
├── pyproject.toml         # Backend package and dependency configuration
├── unit.json              # NGINX Unit configuration
├── uv.lock                # Locked backend dependency graph
└── README.md              # This file
```

The backend uses `server.py` as its composition root. Shared SQLAlchemy setup
lives in `database.py`, while each API feature owns its models, Pydantic schemas,
and router under a dedicated package. Backend tests live under `tests/` and are
organized around the exposed API behavior.

The frontend keeps transport code in `services/`, feature UI in `components/`, and
shared shadcn/ui primitives in `components/ui/`. Every component has its own
subdirectory and is exported from `index.tsx`, which keeps imports concise while
leaving related CSS and support files together. `components/app/index.tsx` composes feature
components and TanStack Query state, while `main.tsx` initializes the browser
entry point. The frontend manifest, lockfile, HTML entry point, Vite, TypeScript,
ESLint, and shadcn configuration are colocated under `frontend/`. Unit and
application tests belong in `frontend/tests/components/` and mirror the source
component hierarchy, including `index.test.tsx` filenames. Service tests live
under `frontend/tests/services/` and verify HTTP request contracts and errors.
Use `@/` imports for modules beneath `frontend/`. Keep component-specific CSS in a named file beside the
component and import it there. Reserve `index.css` for Tailwind imports, shared
theme tokens, and global base styles; utility-only components do not need a
separate stylesheet.

Python project metadata remains at the repository root as `pyproject.toml`,
`uv.lock`, and `.python-version`. Keeping uv and IDE discovery at the standard
root avoids extra `--project` flags throughout development and the container
build without creating a separately distributable Python project.

NGINX Unit routes `/api/*` to `backend.server:app`. All other paths are served
from the compiled `frontend/` bundle in the same container, keeping frontend
requests same-origin.

## License

MIT
