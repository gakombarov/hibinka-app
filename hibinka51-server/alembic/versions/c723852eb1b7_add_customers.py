"""add_customers

Revision ID: c723852eb1b7
Revises: a4b342ff2077
Create Date: 2026-04-27 07:32:57.591732

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c723852eb1b7'
down_revision: Union[str, None] = 'a4b342ff2077'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
