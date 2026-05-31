"""repair_restaurant_schedule_id_sequence

Revision ID: a1b2c3d4e5f6
Revises: 0c0135683609
Create Date: 2026-05-31

The previous migration (0c0135683609) renamed the primary key column from
'id' to 'restaurant_schedule_id' using add_column + drop_column, which
orphaned/destroyed the underlying PostgreSQL sequence. This left the column
as a plain INTEGER with no default, causing NOT NULL violations on insert.

This migration repairs the column by creating a new sequence and attaching
it as the column default, effectively restoring autoincrement behaviour.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0c0135683609'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEQ_NAME = 'restaurant_schedules_restaurant_schedule_id_seq'


def upgrade() -> None:
    """Attach a sequence to restaurant_schedule_id to restore autoincrement."""
    op.execute(f"CREATE SEQUENCE IF NOT EXISTS {SEQ_NAME}")
    op.execute(
        f"SELECT setval('{SEQ_NAME}', "
        f"(SELECT COALESCE(MAX(restaurant_schedule_id), 0) + 1 FROM restaurant_schedules))"
    )
    op.execute(
        f"ALTER TABLE restaurant_schedules "
        f"ALTER COLUMN restaurant_schedule_id SET DEFAULT nextval('{SEQ_NAME}')"
    )
    op.execute(
        f"ALTER SEQUENCE {SEQ_NAME} OWNED BY restaurant_schedules.restaurant_schedule_id"
    )


def downgrade() -> None:
    """Remove the sequence default (column becomes a plain integer again)."""
    op.execute(
        "ALTER TABLE restaurant_schedules "
        "ALTER COLUMN restaurant_schedule_id DROP DEFAULT"
    )
    op.execute(f"DROP SEQUENCE IF EXISTS {SEQ_NAME}")
