from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from backend.config import get_settings
from backend.counters.models import Counter

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The model import is required before exposing metadata so autogeneration sees
# every mapped table without requiring migration files to know application
# startup order.
target_metadata = Counter.metadata


def get_database_url() -> str:
    configured_url = config.attributes.get("database_url")
    if configured_url is not None:
        return str(configured_url)
    return get_settings().database_url


def run_migrations_offline() -> None:
    database_url = get_database_url()
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        render_as_batch="sqlite" in database_url,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    database_url = get_database_url()
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = database_url
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_as_batch=connection.dialect.name == "sqlite",
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
