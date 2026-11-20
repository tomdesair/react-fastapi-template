from fastapi.testclient import TestClient

from backend.server import create_app
from backend.tests.base import MigratedDatabaseTest


class TestDatabaseMigration(MigratedDatabaseTest):
    def test_database_migration_creates_schema_and_seeds_default(self) -> None:
        with TestClient(create_app(self.database_url)) as client:
            assert client.get("/api/counters").json() == [
                {"id": 1, "color": "#0000ff", "value": 0}
            ]
