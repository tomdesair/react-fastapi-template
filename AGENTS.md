# AI Agent Guide

## Start of every conversation

Always read this full file and the full `README.md` before inspecting code,
making changes, or running commands. Treat this file as the repository's
operational guide and keep it consistent with the README and current project
configuration.

## Developer mode: efficient, KISS, and secure

Be a lazy senior developer: lazy means efficient, not careless. Follow KISS
("Keep It Simple, Stupid") and YAGNI ("You Aren't Gonna Need It") principles.
The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? Apply YAGNI.
2. Does the standard library already do it? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an installed dependency solve it? Use it.
5. Can the implementation be one line? Make it one line.
6. Only then, write the minimum code that works.

### Simplicity rules

- Do not add abstractions, extension points, or configuration that were not
  explicitly requested.
- Do not add a dependency when existing code, the platform, or the standard
  library can solve the problem without materially worse correctness or
  security.
- Do not add boilerplate, compatibility layers, or speculative future support.
- Prefer deletion over addition, boring over clever, and the fewest files and
  moving parts that satisfy the request.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- When two standard-library approaches require the same code, choose the one
  with correct edge-case behavior. Lazy means less code, not a flimsier
  algorithm.
- Mark intentional simplifications with a `KISS:` comment. If a shortcut has a
  known ceiling, such as a global lock, an O(n²) scan, or a naive heuristic,
  the comment names the ceiling and the concrete upgrade path.
- Non-trivial logic leaves one runnable check behind: the smallest assertion,
  self-check, or focused test that fails when the logic breaks. Avoid adding a
  test framework or fixture machinery; trivial one-liners need no test.

### The "2-Year Maintainability Rule" for Inline Documentation & Code Readability

- **The "2-Year Maintainability Rule"**: Every single fix, complicated or
  non-trivial code block, boundary condition, and `if`-test MUST include
  thorough inline comments explaining *why* that specific call, calculation,
  or branch condition was chosen. The code must be documented so clearly that
  after 2 years, any maintainer can immediately understand the reasoning,
  edge-case rationale, or protocol specification behind it without having to
  reverse-engineer the commit history.
- Write natural, explanatory comments describing the reasoning and intent
  directly. Do NOT prefix comments with literal meta-labels such as `The
  2-Year Maintainability Rule:` or review audit section identifiers (e.g.,
  `H5:`).
- **No Agent File References**: Never mention `AGENTS.md` or reference
  `AGENTS.md` rules in source code comments. Comments must describe the
  engineering intent and domain logic directly without referencing agent
  prompt files, meta-rules, or instruction documents.
- Keep comment line breaks balanced and clean within the 100-character column
  limit enforced by Python or Typescript code formatters.
- Always write and preserve thorough inline comments across all main and test
  code source files to explain non-obvious algorithms, multi-step operations,
  and complex logic.
- Ensure all function implementations remain short, clean, well-documented,
  and stick to the same level of abstraction. Use helper methods to break down
  complex logic into smaller, readable pieces.

### Security rules

Be security-minded: trust nothing, verify everything, use defense in depth,
and fail securely. Simplicity never justifies insecurity.

- Treat inputs, URLs, files, environment variables, dependencies, and identity
  claims as untrusted. Validate type, bounds, length, encoding, and allowed
  values; use contextual escaping and allowlists, not ad-hoc sanitization.
- Default to deny and least privilege. Enforce authentication and authorization
  server-side for every protected object and action.
- Never hardcode or commit secrets. Never expose private data, stack traces, or
  internals in responses or logs; log safe diagnostics internally.
- Use established framework or standard-library protections for parameterized
  queries, cryptography, password hashing, CSRF, cookies, and temporary files.
  Never invent security primitives.
- Treat paths, redirects, shell/subprocess calls, deserialization, SSRF,
  uploads, weak randomness, permissive CORS, sessions, and missing timeouts or
  resource limits as security-sensitive.
- Review dependency changes and known vulnerabilities. Reject bypasses of
  integrity checks and avoid adding a security dependency or making breaking
  auth changes without explicit approval.
- Add a brief comment only when a non-obvious security constraint needs to
  survive future edits; comments and dependencies must provide real protection,
  not security theater.
- Prioritize fixes by impact: critical first (secrets, injection, command/path
  traversal, auth bypass, unsafe deserialization, SSRF, sensitive-data
  exposure), then high (XSS, CSRF, IDOR, session/security headers/rate-limit
  failures), then medium/defense-in-depth. Do not defer a critical issue for a
  cosmetic enhancement.
- Verify the actual threat is blocked, add the smallest negative test for a
  likely malicious or bypass case, and run the relevant format, lint, build,
  and full test commands without weakening unrelated behavior.
- Stop for review when cryptographic, authentication, authorization, or
  network-boundary behavior is uncertain. Do not publish exploit details for a
  public repository vulnerability until an effective fix is available.

Not lazy means: input validation at trust boundaries, data-preserving error
handling, security, accessibility, real-hardware calibration where platform
behavior differs from the ideal (clocks drift and sensors read off), and every
explicit requirement. Code without the appropriate check is unfinished.

## Architecture

This project is one full-stack application deployed as one FastAPI/Uvicorn
container:

- `backend/` contains the FastAPI application and Python package:
  - `backend/config.py` owns typed Pydantic Settings definitions, defaults,
    environment-variable loading, and optional `.env` loading.
  - `backend/database.py` owns the SQLAlchemy engine, session, declarative
    base, and connection lifecycle. It must not initialize feature schemas or
    seed feature data.
  - `backend/migrations/` owns Alembic configuration, migration versions, and
    the reusable migration runner. Schema creation and seed data belong in
    migrations, not FastAPI startup or `backend/database.py`.
  - `backend/counters/` owns counter persistence models, Pydantic request and
    response schemas, and `/api/counters` routes.
  - `backend/health/` owns `/api/health` liveness and readiness routes.
  - `backend/tests/` contains focused endpoint tests organized around API
    features. Keep feature-specific tests in this package instead of expanding
    `backend/server.py`.
  - `backend/server.py` is the composition root: it configures the FastAPI
    lifecycle and includes routers.
- `frontend/` contains the React 19 and TypeScript application:
  - The frontend is a self-contained pnpm project. Its package manifest,
    lockfile, workspace policy, Vite, ESLint, TypeScript, shadcn, and HTML
    entry-point configuration all live under `frontend/`.
  - `frontend/services/` owns typed HTTP clients and TanStack Query keys. Do
    not name frontend source directories `api`: Vite's `/api` proxy would
    intercept their transformed module URLs during development.
  - `frontend/components/` contains reusable feature and UI components;
    shadcn/ui primitives remain under `frontend/components/ui/`. Every
    component must have its own subdirectory with an `index.tsx`; keep related
    component-named CSS and support files in that directory. Keep
    `frontend/index.css` limited to Tailwind imports, shared theme tokens, and
    truly global base styles.
  - `frontend/components/app/index.tsx` composes application-level pages and
    server-state queries and mutations. `frontend/main.tsx` provides the
    browser and Query client entry point.
  - `frontend/tests/` contains Vitest and React Testing Library tests for the
    application and components. Mirror the component hierarchy under
    `frontend/tests/components/`: for example, a test for
    `components/counters/counter-card/index.tsx` belongs in
    `tests/components/counters/counter-card/index.test.tsx`. Service tests
    belong under `frontend/tests/services/` and should cover request contracts
    and error handling.
- `backend/server.py` routes `/api/*` requests and mounts the compiled frontend
  bundle for every other request.
- The frontend and backend share an origin in production, so frontend API calls
  use relative `/api/...` URLs without CORS configuration.
- During local development, Vite runs on port 5173 and proxies `/api` to the
  FastAPI development server on port 8000.
- `docker/Dockerfile` builds the frontend with pnpm, installs backend dependencies
  with uv, and combines the static bundle and Python application in a Python
  3.15.2 runtime image. `docker/start.sh` launches Uvicorn with validated
  worker and per-worker concurrency limits from the environment after running
  `alembic upgrade head` once.

## Technology and tooling

- Python 3.15+ with FastAPI, Pydantic, Pydantic Settings, SQLAlchemy, and
  Uvicorn.
- uv manages Python dependencies and the committed `uv.lock` file.
- React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, and TanStack Query power
  the frontend. TanStack libraries are headless and should be added only when a
  concrete feature needs their specific capability:
  - **Query** is already installed; use it for server-state fetching, caching,
    retries, synchronization, and mutations. Do not copy remote API data into
    a separate client store.
  - **Router** is appropriate once the app has multiple or nested routes,
    type-safe navigation, route-level loading, or validated URL search state.
  - **Table** is appropriate for feature-rich client-side data grids requiring
    sorting, filtering, grouping, pagination, or column state—not a small,
    static HTML table.
  - **Form** is appropriate for complex, typed forms with reusable validation,
    field arrays, cross-field dependencies, or multi-step state—not a few
    inputs that native React and browser validation cover.
  - **Virtual** is appropriate when large lists or grids render too many DOM
    nodes; first verify that pagination or a normal DOM list is insufficient.
  - **Pacer** is appropriate for recurring UI timing concerns such as
    debouncing, throttling, batching, and queues. Backend rate limits and
    security controls still belong on the server.
  - **Store** is for shared reactive client state; **DB** is for local-first
    synchronized collections and optimistic/offline workflows. Do not use
    either as a second home for Query-managed server state.
  - **AI** is appropriate only when the feature explicitly needs AI streaming
    or client-side AI primitives. Do not add it for ordinary HTTP APIs.
  - **Start** is a full-stack React framework and conflicts with this
    Vite/FastAPI architecture; adopting it requires an explicit architecture
    decision, not a feature-level dependency addition.
  - When a chosen TanStack library provides **Devtools**, add them only if the
    team needs their diagnostics and keep them development-only.
  Before adopting another library, confirm the current package status and
  React compatibility; beta libraries require explicit justification.
- pnpm manages Node dependencies with the committed
  `frontend/pnpm-lock.yaml` and `frontend/pnpm-workspace.yaml` files.
- Backend tests use pytest and FastAPI's `httpx2`-backed `TestClient`.
- Frontend tests use Vitest, jsdom, and React Testing Library.
- `just` is the public command interface for installation, development,
  testing, builds, and production-container startup.
- GitHub Actions in `.github/workflows/ci.yml` checks formatting and linting,
  runs all tests, and validates the production container build on pull requests
  and pushes to `main` without publishing an image.
- Docker or Podman and Uvicorn provide the production deployment. Container
  recipes auto-detect Docker first and then Podman; `CONTAINER_ENGINE` can
  explicitly select either engine.

## Working conventions

- Keep backend code and tests under `backend/`.
- Keep React source, assets, shadcn components, frontend tests, and all
  frontend-specific configuration under `frontend/`.
- Put every React component in a separate component subdirectory with an
  `index.tsx`; do not add component `.tsx` files directly under `components/`
  or alongside sibling component files.
- Keep frontend component test paths aligned with their source paths. Mirror
  `frontend/components/` beneath `frontend/tests/components/` and name the test
  for each `index.tsx` component `index.test.tsx`.
- Do not add component-specific selectors to `frontend/index.css`. Colocate a
  named CSS file with any component that needs custom styles; components that
  use only utility classes need no CSS file.
- Use `@/` imports for frontend modules beneath `frontend/`.
- Run frontend tools with `pnpm --dir frontend` when invoking pnpm directly
  from the repository root. Prefer the corresponding `just` recipe for the
  public workflow.
- Keep `pyproject.toml`, `uv.lock`, and `.python-version` at the repository root.
  uv, Python packaging tools, and IDEs conventionally discover these project
  metadata files there; moving them would add `--project` handling to normal
  development and container workflows without isolating a separate Python
  distribution.
- Preserve the `/api` prefix for FastAPI routes and relative frontend API calls.
- Configure non-default databases with `DATABASE_URL`; the default SQLite
  database is `database.db` in the repository root. `.env` values are loaded by
  `backend/config.py`; environment variables override `.env`, and explicit
  `create_app()` test values override both. Keep defaults and fallbacks in the
  settings module rather than `server.py`.
- Keep `backend/database.py` generic and feature-agnostic. Never import
  counter models or place counters schema/data bootstrap logic there.
- Run `just migrate` after model changes, then create a reviewed revision with
  `uv run alembic revision --autogenerate -m "description"`. Apply it with
  `just migrate` and run `uv run alembic check`.
- Put one-time reference or seed data in a migration using migration-local
  `sqlalchemy.table` definitions or raw SQL. Do not import live ORM models into
  migration versions because future model changes must not rewrite historical
  migration behavior.
- Run migrations once before Uvicorn workers start. Never call migration
  commands from a FastAPI lifespan hook or request handler.
- Review autogenerated migrations manually, especially SQLite alterations,
  constraint names, column renames, and destructive downgrade operations.
- Whenever a configuration property is added or changed, update
  `.env.example` in the same change. Use a safe non-secret example value and
  document required or optional behavior where appropriate.
- Keep local development, production routing, Docker paths, and documentation
  in sync when moving or adding application entry points.
- Add backend development dependencies to the `dev` dependency group in
  `pyproject.toml` with uv. Add frontend development dependencies with pnpm.
- Commit dependency-lock updates together with manifest changes.
- When a new technology, runtime, library, service, or major tool is added,
  update this `AGENTS.md` file in the same change, including its purpose and
  any agent-relevant commands or constraints.

### Git & Commit Message Conventions

When creating Git commits, strictly follow the **Conventional Commits** specification:

`<type>[optional scope]: <description>`

#### Rules
- **Types:** Use only `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, or `chore`.
- **Subject line:** Use the imperative mood (e.g., "add", "fix", "update"), keep it under 72 characters, do not capitalize the first word after the colon, and omit a trailing period.
- **Scope:** Keep scopes short and lowercase (e.g., `auth`, `api`, `ui`), matching the affected module or directory.
- **Breaking changes:** Append `!` before the colon (e.g., `feat(api)!: remove v1 endpoints`) and include a `BREAKING CHANGE:` footer explaining the migration path.
- **Body:** For non-trivial changes, add a blank line after the subject and briefly explain *why* the change was made (wrapped at 72 characters).
- **Atomic commits:** Group related changes logically; do not mix unrelated refactors and features in a single commit.

#### Examples
- `feat(auth): add password reset token validation`
- `fix(cart): prevent negative item quantities`
- `refactor(db): extract connection pooling helper`
- `docs: update local setup instructions in README`


## Commands

Run commands from the repository root:

- `just install` installs both dependency sets.
- `just migrate` applies all pending Alembic database migrations.
- `just develop backend` starts FastAPI with reload.
- `just develop frontend` starts Vite with hot reload.
- `just test backend` runs the backend pytest suite.
- `just test frontend` runs the frontend Vitest suite.
- `just format` formats backend Python and frontend source files.
- `just build` builds the complete production container with Docker or Podman.
- `just start` runs that container with the selected engine on port 8080 by
  default.

The direct production checks for each side are `uv sync --locked --no-dev` for
the backend and `pnpm --dir frontend run build` for the frontend. Use the
smallest relevant test or build command while developing, then run both sides'
checks when shared configuration or the container layout changes.
