from pathlib import Path

from fastapi.testclient import TestClient

from backend.migrations.runner import upgrade_database
from backend.server import create_app


def test_compiled_frontend_is_served_after_api_routes(tmp_path: Path) -> None:
    frontend_dir = tmp_path / "frontend"
    frontend_dir.mkdir()
    (frontend_dir / "index.html").write_text("<h1>React app</h1>", encoding="utf-8")
    database_url = f"sqlite:///{tmp_path / 'database.db'}"
    upgrade_database(database_url)

    # A mounted static directory must sit after API routing; otherwise an
    # identically named frontend path could hide a working backend endpoint.
    with TestClient(
        create_app(
            database_url=database_url,
            frontend_dir=frontend_dir,
        )
    ) as client:
        assert client.get("/").text == "<h1>React app</h1>"
        assert client.get("/api/counters").status_code == 200
