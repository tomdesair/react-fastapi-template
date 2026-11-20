"""Create counters and seed the first-start default.

Revision ID: 20261120_01
Revises:
Create Date: 2026-11-20
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261120_01"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "counters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(length=7), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.CheckConstraint("value >= 0", name="non_negative_value"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("color"),
    )
    counters = sa.table(
        "counters",
        sa.column("color", sa.String(length=7)),
        sa.column("value", sa.Integer()),
    )
    op.bulk_insert(counters, [{"color": "#0000ff", "value": 0}])


def downgrade() -> None:
    op.drop_table("counters")
