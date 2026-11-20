from collections.abc import Iterator
from dataclasses import dataclass
from typing import cast

from fastapi import Request
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

DEFAULT_COUNTER_COLOR = "#0000ff"


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


def initialize_database(database: Database) -> None:
    # Import here so model registration happens before create_all without a
    # circular dependency between generic database setup and feature models.
    from backend.counters.models import Counter

    # create_all makes missing databases and newly introduced tables safe to
    # initialize; existing rows remain untouched.
    Base.metadata.create_all(database.engine)
    with database.sessions() as session:
        # The blue record is a first-start default, not a rule that repopulates
        # a deliberately empty counter collection on every request.
        if session.scalar(select(Counter.id).limit(1)) is not None:
            return

        session.add(Counter(color=DEFAULT_COUNTER_COLOR))
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            # Concurrent application starts may both observe an empty database.
            # Treat the losing insert as success only when the winner created
            # the exact required color; unrelated constraint failures must
            # still stop startup.
            if (
                session.scalar(
                    select(Counter.id).where(Counter.color == DEFAULT_COUNTER_COLOR)
                )
                is None
            ):
                raise


def get_database_session(request: Request) -> Iterator[Session]:
    # The lifespan hook establishes this object before FastAPI accepts
    # requests, so the cast records that invariant without a runtime fallback.
    database = cast(Database, request.app.state.database)
    with database.sessions() as session:
        yield session
