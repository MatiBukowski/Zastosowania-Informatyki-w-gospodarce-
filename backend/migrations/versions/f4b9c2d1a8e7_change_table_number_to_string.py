"""Change table number to string

Revision ID: f4b9c2d1a8e7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-31 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f4b9c2d1a8e7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'restaurant_table',
        'table_number',
        existing_type=sa.Integer(),
        type_=sa.String(length=80),
        existing_nullable=False,
        postgresql_using='table_number::text',
    )


def downgrade() -> None:
    op.alter_column(
        'restaurant_table',
        'table_number',
        existing_type=sa.String(length=80),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='table_number::integer',
    )
