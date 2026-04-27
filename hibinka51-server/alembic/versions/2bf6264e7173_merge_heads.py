"""merge_heads

Revision ID: 2bf6264e7173
Revises: 5048f626f406, f1a2b3c4d5e6
Create Date: 2026-04-27 11:46:54.305758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2bf6264e7173'
down_revision: Union[str, None] = ('5048f626f406', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
