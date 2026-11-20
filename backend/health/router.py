from typing import cast

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from backend.database import Database

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/alive")
def alive() -> dict[str, str]:
    return {"status": "alive"}


@router.get("/ready")
def ready(request: Request) -> dict[str, str]:
    # Startup owns database initialization; readiness independently verifies
    # that a real pooled connection can still execute a round-trip query.
    database = cast(Database, request.app.state.database)
    try:
        with database.sessions() as session:
            session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        # Kubernetes readiness must remove the instance from traffic when the
        # backing database is unavailable, without exposing connection details.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        ) from None
    return {"status": "ready"}
