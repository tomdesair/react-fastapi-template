tag := 'react-fastapi-container'

# List available recipes
list:
    @just --list --unsorted

# Install all project dependencies
install:
    uv sync --dev
    pnpm --dir frontend install

alias i := install

# Apply all pending database migrations
migrate:
    uv run alembic upgrade head

# Format backend and frontend source code
format:
    uv run ruff format backend
    pnpm --dir frontend exec prettier --write --log-level silent .

# Select the container engine used by the build and start recipes.
[private]
container-engine:
    #!/usr/bin/env sh
    set -eu

    # An explicit value lets users choose Podman even when both CLIs are installed.
    if [ -n "${CONTAINER_ENGINE:-}" ]; then
        case "${CONTAINER_ENGINE}" in
            docker | podman)
                printf '%s\n' "${CONTAINER_ENGINE}"
                exit 0
                ;;
            *)
                echo "Invalid CONTAINER_ENGINE: ${CONTAINER_ENGINE}. Use 'docker' or 'podman'." >&2
                exit 1
                ;;
        esac
    fi

    # Prefer Docker for backwards compatibility, then fall back to Podman.
    if command -v docker >/dev/null 2>&1; then
        echo docker
    elif command -v podman >/dev/null 2>&1; then
        echo podman
    else
        echo "Container engine not found. Install Docker or Podman, or set CONTAINER_ENGINE." >&2
        exit 1
    fi

# Build the production container
build:
    #!/usr/bin/env sh
    set -eu
    engine="$(just --quiet container-engine)"
    if [ "$engine" = "podman" ]; then
        "$engine" build --format docker -f docker/Dockerfile -t {{ tag }} .
    else
        "$engine" build -f docker/Dockerfile -t {{ tag }} .
    fi

# Run the production container on a specified port; Default port: 8080
start port='8080':
    #!/usr/bin/env sh
    set -eu
    engine="$(just --quiet container-engine)"
    "$engine" run --rm -it \
        -e DATABASE_URL \
        -e UVICORN_WORKERS \
        -e UVICORN_LIMIT_CONCURRENCY \
        -p {{ port }}:8000 {{ tag }}

# Run a project target in development mode
develop target:
    #!/usr/bin/env sh
    if [ "{{target}}" = "frontend" ]; then
        pnpm --dir frontend run dev
    elif [ "{{target}}" = "backend" ]; then
        uv run uvicorn backend.server:app --reload
    else
        echo "Invalid target: {{target}}. Use 'frontend' or 'backend'."
        exit 1
    fi

alias dev := develop

# Run a project's test suite
test target:
    #!/usr/bin/env sh
    if [ "{{target}}" = "frontend" ]; then
        pnpm --dir frontend run test
    elif [ "{{target}}" = "backend" ]; then
        uv run python -m pytest backend/tests
    else
        echo "Invalid target: {{target}}. Use 'frontend' or 'backend'."
        exit 1
    fi
