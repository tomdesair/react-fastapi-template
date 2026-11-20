from pathlib import Path

from fastapi.testclient import TestClient

from backend.migrations.runner import upgrade_database
from backend.server import create_app


def test_database_migration_creates_schema_and_seeds_default(tmp_path: Path) -> None:
    database_url = f"sqlite:///{tmp_path / 'shared.db'}"

    upgrade_database(database_url)

    with TestClient(create_app(database_url)) as client:
        assert client.get("/api/counters").json() == [
            {"id": 1, "color": "#0000ff", "value": 0}
        ]
