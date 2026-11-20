from pathlib import Path

import pytest

from backend.migrations.runner import upgrade_database


class MigratedDatabaseTest:
    database_url: str

    @pytest.fixture(autouse=True)
    def setup(self, tmp_path: Path) -> None:
        # Each test gets an independent migrated database, so class-based tests
        # do not leak counters or schema state into one another.
        self.database_url = f"sqlite:///{tmp_path / 'database.db'}"
        upgrade_database(self.database_url)
