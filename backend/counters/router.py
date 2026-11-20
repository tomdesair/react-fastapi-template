from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.counters.models import Counter
from backend.counters.schemas import CounterCreate, CounterIncrement, CounterRead
from backend.database import get_database_session

router = APIRouter(prefix="/api/counters", tags=["counters"])
DatabaseSession = Annotated[Session, Depends(get_database_session)]


@router.get("", response_model=list[CounterRead])
def list_counters(session: DatabaseSession) -> list[Counter]:
    return list(session.scalars(select(Counter).order_by(Counter.id)))


@router.post("", response_model=CounterRead, status_code=status.HTTP_201_CREATED)
def create_counter(counter: CounterCreate, session: DatabaseSession) -> Counter:
    created = Counter(color=counter.color)
    session.add(created)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        # Only duplicate colors reach this route under the current request
        # validation and model constraints, so expose an actionable 409 rather
        # than leaking the driver's database-specific exception.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Color is already used. Pick another color.",
        ) from None

    session.refresh(created)
    return created


@router.post("/{counter_id}/increment", response_model=CounterRead)
def increment_counter(
    counter_id: int,
    increment: CounterIncrement,
    session: DatabaseSession,
) -> Counter:
    counter = session.get(Counter, counter_id)
    # Return 404 for stale cards or guessed IDs instead of silently creating a
    # new counter, which would make an increment request non-idempotent in scope.
    if counter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Counter not found"
        )

    counter.value += increment.amount
    session.commit()
    session.refresh(counter)
    return counter


@router.delete("/{counter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_counter(counter_id: int, session: DatabaseSession) -> Response:
    counter = session.get(Counter, counter_id)
    # Deletion is resource-addressed, so a missing ID is a normal 404 response
    # rather than a success that could hide client-side synchronization bugs.
    if counter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Counter not found"
        )

    session.delete(counter)
    session.commit()
    # A successful DELETE has no representation to return; 204 also avoids
    # requiring clients to parse an artificial response body.
    return Response(status_code=status.HTTP_204_NO_CONTENT)
