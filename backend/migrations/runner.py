from pathlib import Path

from alembic import command
from alembic.config import Config


def upgrade_database(database_url: str) -> None:
    # A single explicit URL keeps test and production migrations deterministic
    # while Alembic's ordinary CLI configuration still comes from Settings.
    config_path = Path(__file__).resolve().parents[2] / "alembic.ini"
    config = Config(config_path)
    config.attributes["database_url"] = database_url
    command.upgrade(config, "head")
