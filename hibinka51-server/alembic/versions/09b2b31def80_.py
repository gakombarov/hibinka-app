"""
Revision ID: 09b2b31def80
Revises: 7886955567c4
Create Date: 2026-05-07 11:34:12.505559
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision: str = '09b2b31def80'
down_revision: Union[str, None] = '7886955567c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('vehicles', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('vehicles', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.add_column('vehicles', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('vehicles', sa.Column('updated_at', sa.DateTime(), nullable=True))

    now = datetime.utcnow()
    op.execute(f"UPDATE vehicles SET is_deleted = false, created_at = '{now}', updated_at = '{now}'")

    op.alter_column('vehicles', 'is_deleted', nullable=False)
    op.alter_column('vehicles', 'created_at', nullable=False)
    op.alter_column('vehicles', 'updated_at', nullable=False)

    op.alter_column('vehicles', 'alias', existing_type=sa.VARCHAR(length=50), nullable=False)
    op.alter_column('vehicles', 'capacity', existing_type=sa.INTEGER(), nullable=False)

    op.create_index(op.f('ix_vehicles_id'), 'vehicles', ['id'], unique=False)
    op.create_unique_constraint('uq_vehicles_license_plate', 'vehicles', ['license_plate'])

def downgrade() -> None:
    op.drop_constraint('uq_vehicles_license_plate', 'vehicles', type_='unique')
    op.drop_index(op.f('ix_vehicles_id'), table_name='vehicles')
    op.alter_column('vehicles', 'capacity', existing_type=sa.INTEGER(), nullable=True)
    op.alter_column('vehicles', 'alias', existing_type=sa.VARCHAR(length=50), nullable=True)
    op.drop_column('vehicles', 'updated_at')
    op.drop_column('vehicles', 'created_at')
    op.drop_column('vehicles', 'deleted_at')
    op.drop_column('vehicles', 'is_deleted')