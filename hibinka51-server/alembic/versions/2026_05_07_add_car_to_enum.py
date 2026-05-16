from alembic import op
import sqlalchemy as sa

revision = 'add_car_to_enum_fixed'
down_revision = '441f20579b9d'
branch_labels = None
depends_on = None

def upgrade():
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE vehiclecategory ADD VALUE IF NOT EXISTS 'CAR'")

def downgrade():
    pass