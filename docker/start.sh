#!/usr/bin/env bash
set -euo pipefail

workers="${UVICORN_WORKERS:-1}"
limit_concurrency="${UVICORN_LIMIT_CONCURRENCY:-}"

if [[ ! "$workers" =~ ^[1-9][0-9]*$ ]]; then
    echo "UVICORN_WORKERS must be a positive integer." >&2
    exit 64
fi

# Schema and seed changes run once before any Uvicorn workers can observe the
# database; a failed migration therefore prevents the application from starting.
python -m alembic upgrade head

command=(python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000)
command+=(--workers "$workers")

if [[ -n "$limit_concurrency" ]]; then
    # Uvicorn enforces this limit inside every worker, so the total possible
    # concurrent connection count is workers multiplied by this value.
    if [[ ! "$limit_concurrency" =~ ^[1-9][0-9]*$ ]]; then
        echo "UVICORN_LIMIT_CONCURRENCY must be a positive integer." >&2
        exit 64
    fi
    command+=(--limit-concurrency "$limit_concurrency")
fi

exec "${command[@]}"
