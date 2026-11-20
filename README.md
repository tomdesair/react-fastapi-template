# React + FastAPI Template

A modern full-stack template featuring React for the frontend and FastAPI for the backend, bundled together in a single container using NGINX Unit.

[Check out the tutorial blog!](https://ajac-zero.com/posts/building-react-fastapi-app-with-nginx-unit/)

## Features

- **React Frontend**
  - TypeScript support
  - TailwindCSS + shadcn/ui components
  - Fast refresh during development
  - Optimized production build

- **FastAPI Backend**
  - Python type hints
  - OpenAPI/Swagger documentation
  - Async support
  - Built-in state management example

- **Production Ready**
  - Single container deployment with NGINX Unit
  - Multi-stage Docker builds
  - Efficient caching for dependencies
  - Static file serving

## Prerequisites

- [just](https://github.com/casey/just) - Command runner
- [pnpm](https://pnpm.io) - Package manager for Node.js
- [uv](https://github.com/astral-sh/uv) - Python package installer

## Development

The project is set up for local development with hot-reload capabilities for both frontend and backend.

### Install development dependencies

```bash
just install
```

### Enable pre-commit checks

After installing the dependencies, install the Git hook:

```bash
uv run pre-commit install
```

The checks then run automatically before each commit. To run them manually
against the entire repository:

```bash
uv run pre-commit run --all-files
```

The hooks format Python with Ruff, lint Python with Ruff, format frontend files
with Prettier, and lint TypeScript with ESLint. The Ruff formatting and linting
steps are separate hooks. A commit is blocked while a check reports an error;
formatters and autofixable lint violations must be reviewed and staged before
committing again.

### Format and lint changes

Always format and lint your changes before committing.

Backend (Ruff):

```bash
uv run ruff format .
uv run ruff check .
```

Frontend (Prettier and ESLint):

```bash
pnpm run format
pnpm run lint
```

Use `pnpm run format:check` to verify frontend formatting without changing
files.

### Start the Backend

```bash
just dev back
```

The FastAPI server will start on http://localhost:8000 with API documentation available at http://localhost:8000/api/docs

### Start the Frontend

```bash
just dev front
```

The React development server will start on http://localhost:5173 and automatically proxy API requests to the backend.

## Production

Build and run the production container:

```bash
just build
just start
```

The application will be available at http://localhost:80 with:

- Frontend static files served directly
- All `/api/*` requests routed to the FastAPI application
- API documentation at http://localhost/api/docs

## Project Structure

```
.
├── api/                    # FastAPI backend
│   ├── __init__.py
│   └── server.py          # Main FastAPI application
├── gui/                    # React frontend
│   ├── assets/            # Static assets
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main React component
│   └── main.tsx          # React entry point
├── Dockerfile             # Multi-stage production build
├── unit.json              # NGINX Unit configuration
└── README.md             # This file
```

## License

MIT
