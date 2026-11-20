from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from backend.server import create_app


def test_alive_reports_healthy_service(tmp_path: Path) -> None:
    with TestClient(create_app(f"sqlite:///{tmp_path / 'alive.db'}")) as client:
        response = client.get("/api/health/alive")
        paths = client.get("/api/openapi.json").json()["paths"]

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
    # Probe routes must also be discoverable through OpenAPI because operators
    # and API consumers rely on the same documented FastAPI contract.
    assert "/api/health/alive" in paths
    assert "/api/health/ready" in paths


def test_ready_checks_database_query(tmp_path: Path) -> None:
    with TestClient(create_app(f"sqlite:///{tmp_path / 'ready.db'}")) as client:
        response = client.get("/api/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_ready_reports_database_failure(tmp_path: Path) -> None:
    def fail_to_open_session() -> None:
        # Raising at session creation models a genuinely unreachable database
        # and ensures readiness reports 503 before SQL can execute.
        raise OperationalError("SELECT 1", {}, Exception("database unavailable"))

    with TestClient(create_app(f"sqlite:///{tmp_path / 'unavailable.db'}")) as client:
        # Replacing only the request-visible database adapter isolates this
        # failure mode without changing the lifespan or application router.
        client.app.state.database = SimpleNamespace(sessions=fail_to_open_session)
        response = client.get("/api/health/ready")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}
