from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.config import get_settings
from backend.counters.router import router as counters_router
from backend.database import create_database, initialize_database
from backend.health.router import router as health_router


def create_app(database_url: str | None = None) -> FastAPI:
    # Resolve settings while constructing this app instance so tests can change
    # configuration without sharing stale process-global settings.
    settings = get_settings(database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        database = create_database(settings.database_url)
        app.state.database = database
        initialize_database(database)
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
    return app


app = create_app()
