from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Counter(Base):
    __tablename__ = "counters"
    # Keep the non-negative invariant in the database as defense in depth,
    # because SQL or a future client can bypass Pydantic request validation.
    __table_args__ = (CheckConstraint("value >= 0", name="non_negative_value"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # The database constraint is the final authority for concurrent attempts
    # to create the same canonical six-digit color.
    color: Mapped[str] = mapped_column(String(7), unique=True, nullable=False)
    value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
