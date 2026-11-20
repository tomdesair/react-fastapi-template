from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # A relative SQLite URL keeps a freshly cloned template runnable without
    # infrastructure, while Pydantic rejects an accidentally blank override.
    database_url: str = Field(
        default="sqlite:///./database.db",
        min_length=1,
        description="SQLAlchemy database URL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_settings(database_url: str | None = None) -> Settings:
    # Explicit constructor values are reserved for tests and callers that need a
    # deterministic database; otherwise Settings applies its documented source
    # precedence: environment, .env, then the class default.
    if database_url is None:
        return Settings()
    return Settings(database_url=database_url)
