from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.config import get_settings
from backend.counters.router import router as counters_router
from backend.database import create_database
from backend.health.router import router as health_router


def create_app(
    database_url: str | None = None, frontend_dir: Path | None = None
) -> FastAPI:
    # Resolve settings while constructing this app instance so tests can change
    # configuration without sharing stale process-global settings.
    settings = get_settings(database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        database = create_database(settings.database_url)
        app.state.database = database
        try:
            yield
        finally:
            # Releasing pooled connections is part of shutdown and must happen
            # even when serving is interrupted by an exception.
            database.engine.dispose()

    app = FastAPI(
        lifespan=lifespan,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        title="React + FastAPI Template",
    )
    app.include_router(counters_router)
    app.include_router(health_router)

    # Keep static serving behind the API routes so `/api/*` can never be
    # shadowed by a similarly named file in the compiled frontend.
    if frontend_dir is not None:
        app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

    return app


frontend_dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"
app = create_app(frontend_dir=frontend_dist if frontend_dist.is_dir() else None)
