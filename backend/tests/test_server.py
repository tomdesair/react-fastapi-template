from pathlib import Path

from fastapi.testclient import TestClient

from backend.server import create_app
from backend.tests.base import MigratedDatabaseTest


class TestServer(MigratedDatabaseTest):
    def test_compiled_frontend_is_served_after_api_routes(self, tmp_path: Path) -> None:
        frontend_dir = tmp_path / "frontend"
        frontend_dir.mkdir()
        (frontend_dir / "index.html").write_text("<h1>React app</h1>", encoding="utf-8")

        # A mounted static directory must sit after API routing; otherwise an
        # identically named frontend path could hide a working API endpoint.
        with TestClient(
            create_app(
                database_url=self.database_url,
                frontend_dir=frontend_dir,
            )
        ) as client:
            assert client.get("/").text == "<h1>React app</h1>"
            assert client.get("/api/counters").status_code == 200
