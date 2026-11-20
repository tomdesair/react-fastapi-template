tag := 'react-fastapi-container'

# List available recipes
list:
    @just --list --unsorted

# Install all project dependencies
install:
    uv sync --dev
    pnpm --dir frontend install

alias i := install

# Format backend and frontend source code
format:
    uv run ruff format backend
    pnpm --dir frontend exec prettier --write --log-level silent .

# Build the unit container
build:
    docker build -t {{tag}} .

# Run the unit container on a specified port; Default port: 8080
start port='8080':
    docker run --rm -it -p {{port}}:80 {{tag}}

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
