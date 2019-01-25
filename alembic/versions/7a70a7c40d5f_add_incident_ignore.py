"""Add Incident.ignore

Revision ID: 7a70a7c40d5f
Revises: f4307b9a50e7
Create Date: 2019-01-25 19:32:06.479440

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '7a70a7c40d5f'
down_revision = 'f4307b9a50e7'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('incidents', sa.Column('ignore', sa.Boolean))


def downgrade():
    op.drop_column('incidents', 'ignore')
