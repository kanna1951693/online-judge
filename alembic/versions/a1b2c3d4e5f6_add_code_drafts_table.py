"""add code_drafts table

Revision ID: a1b2c3d4e5f6
Revises: c28c894e6377
Create Date: 2026-06-26 09:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f3a2c1d7b9e4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'code_drafts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'),
                  nullable=False, index=True),
        sa.Column('problem_slug', sa.String(128), nullable=False),
        sa.Column('language', sa.String(16), nullable=False),
        sa.Column('code', sa.Text, nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )
    # Unique per user + problem + language — so upsert works cleanly
    op.create_unique_constraint(
        'uq_code_drafts_user_problem_lang',
        'code_drafts',
        ['user_id', 'problem_slug', 'language']
    )


def downgrade() -> None:
    op.drop_table('code_drafts')
