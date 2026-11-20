from pathlib import Path

from pytest import MonkeyPatch

from backend.config import get_settings


def test_settings_use_default_database(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    # Changing into an isolated directory ensures this assertion cannot observe
    # a repository .env file and proves the actual class-level fallback.
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("DATABASE_URL", raising=False)

    assert get_settings().database_url == "sqlite:///./database.db"


def test_environment_overrides_dotenv(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    # The two sources intentionally disagree so the test captures Pydantic
    # Settings precedence rather than merely proving that either source loads.
    monkeypatch.chdir(tmp_path)
    (tmp_path / ".env").write_text(
        "DATABASE_URL=sqlite:///./from-dotenv.db\n", encoding="utf-8"
    )
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./from-environment.db")

    assert get_settings().database_url == "sqlite:///./from-environment.db"


def test_explicit_database_overrides_configuration(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    # Explicit app-factory values are the strongest source and let tests select
    # temporary databases without mutating process-wide environment state.
    monkeypatch.chdir(tmp_path)
    (tmp_path / ".env").write_text(
        "DATABASE_URL=sqlite:///./from-dotenv.db\n", encoding="utf-8"
    )
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./from-environment.db")

    assert (
        get_settings("sqlite:///./explicit.db").database_url
        == "sqlite:///./explicit.db"
    )
