"""add_driver_profiles

Revision ID: f1a2b3c4d5e6
Revises: 273a790bc5be
Create Date: 2026-04-27 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'c723852eb1b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'driver_profiles',
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('call_sign', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('is_external', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('status', sa.Enum('READY', 'BUSY', 'OFF_DUTY', name='driverstatus'), nullable=False, server_default='OFF_DUTY'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone'),
    )
    op.create_index('ix_driver_profiles_id', 'driver_profiles', ['id'], unique=False)
    op.create_index('ix_driver_profiles_phone', 'driver_profiles', ['phone'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_driver_profiles_phone', table_name='driver_profiles')
    op.drop_index('ix_driver_profiles_id', table_name='driver_profiles')
    op.drop_table('driver_profiles')
    op.execute("DROP TYPE IF EXISTS driverstatus")
