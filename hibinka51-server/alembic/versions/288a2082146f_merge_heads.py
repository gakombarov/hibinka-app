"""merge heads

Revision ID: 288a2082146f
Revises: add_car_to_enum_fixed, 3995747e12e3
Create Date: 2026-05-07 18:18:52.858546

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '288a2082146f'
down_revision: Union[str, None] = ('add_car_to_enum_fixed', '3995747e12e3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
