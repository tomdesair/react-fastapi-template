from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from backend.server import create_app
from backend.tests.base import MigratedDatabaseTest


class TestHealth(MigratedDatabaseTest):
    def test_alive_reports_healthy_service(self) -> None:
        with TestClient(create_app(self.database_url)) as client:
            response = client.get("/api/health/alive")
            paths = client.get("/api/openapi.json").json()["paths"]

        assert response.status_code == 200
        assert response.json() == {"status": "alive"}
        # Probe routes must remain discoverable through OpenAPI because
        # operators and consumers rely on the same documented contract.
        assert "/api/health/alive" in paths
        assert "/api/health/ready" in paths

    def test_ready_checks_database_query(self) -> None:
        with TestClient(create_app(self.database_url)) as client:
            response = client.get("/api/health/ready")

        assert response.status_code == 200
        assert response.json() == {"status": "ready"}

    def test_ready_reports_database_failure(self) -> None:
        def fail_to_open_session() -> None:
            # Raising at session creation models an unavailable database and
            # ensures readiness reports 503 before SQL can execute.
            raise OperationalError("SELECT 1", {}, Exception("database unavailable"))

        with TestClient(create_app(self.database_url)) as client:
            # Replacing only the request-visible adapter isolates this failure
            # without changing the lifespan or application router.
            client.app.state.database = SimpleNamespace(sessions=fail_to_open_session)
            response = client.get("/api/health/ready")

        assert response.status_code == 503
        assert response.json() == {"detail": "Database is unavailable"}
