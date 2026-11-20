# React + FastAPI Template

A modern full-stack template featuring React for the frontend and FastAPI for
the backend, bundled together in a single container using NGINX Unit.

[Check out the tutorial blog!](https://ajac-zero.com/posts/building-react-fastapi-app-with-nginx-unit/)

## Features

- **React frontend**
  - React 19 and TypeScript
  - TanStack Query for API caching and mutations
  - Tailwind CSS and shadcn/ui components
  - Fast refresh during development
  - Optimized production build
- **FastAPI backend**
  - Python type hints and Pydantic models
  - OpenAPI/Swagger documentation
  - Async support
  - In-memory state example
- **Testing**
  - pytest and FastAPI `TestClient` for the backend
  - Vitest, jsdom, and React Testing Library for the frontend
- **Production ready**
  - Single-container deployment with NGINX Unit
  - Multi-stage Docker build
  - Static file serving and efficient dependency caching

## Prerequisites

- [Node.js](https://nodejs.org/) 24 LTS or newer
- [pnpm](https://pnpm.io/installation) 12 or newer
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [just](https://github.com/casey/just)

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
Docker is only required for the production-container commands and is not
included in these setup instructions.

## Install

Install frontend and backend dependencies:

```bash
just install
```

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

## Testing

Run either suite by target:

```bash
just test backend
just test frontend
```

The tests cover the counter API and the React UI's load-and-increment flow.

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

Pass a different host port to `just start`, for example `just start 3000`.

## Project structure

```text
.
├── backend/               # FastAPI application and pytest tests
│   ├── tests/
│   ├── __init__.py
│   └── server.py
├── frontend/              # React application and Vitest tests
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── AGENTS.md              # Guidance for AI agents
├── Dockerfile             # Multi-stage production build
├── Justfile               # Development, test, and build commands
├── unit.json              # NGINX Unit configuration
└── README.md              # This file
```

NGINX Unit routes `/api/*` to `backend.server:app`. All other paths are served
from the compiled `frontend/` bundle in the same container, keeping frontend
requests same-origin.

## License

MIT
