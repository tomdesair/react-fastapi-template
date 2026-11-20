from collections.abc import Iterator
from dataclasses import dataclass
from typing import cast

from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool


class Base(DeclarativeBase):
    pass


@dataclass(frozen=True)
class Database:
    engine: Engine
    sessions: sessionmaker[Session]


def create_database(database_url: str) -> Database:
    # In-memory SQLite normally creates a separate database per connection.
    # A shared static pool keeps every session in the same test database.
    is_memory_database = database_url in {"sqlite://", "sqlite:///:memory:"}
    engine = create_engine(
        database_url,
        connect_args=(
            # FastAPI runs synchronous dependency functions in worker threads,
            # so SQLite's default connection ownership check must be relaxed.
            {"check_same_thread": False} if database_url.startswith("sqlite") else {}
        ),
        poolclass=StaticPool if is_memory_database else None,
    )
    return Database(engine, sessionmaker(bind=engine))


def get_database_session(request: Request) -> Iterator[Session]:
    # The lifespan hook establishes this object before FastAPI accepts
    # requests, so the cast records that invariant without a runtime fallback.
    database = cast(Database, request.app.state.database)
    with database.sessions() as session:
        yield session
