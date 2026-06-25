"""rename_google_id_to_supabase_auth_id

Revision ID: f3a2c1d7b9e4
Revises: c28c894e6377
Create Date: 2026-06-25 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f3a2c1d7b9e4'
down_revision: Union[str, Sequence[str], None] = 'c28c894e6377'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint('uq_users_google_id', 'users', type_='unique')
    op.alter_column(
        'users',
        'google_id',
        new_column_name='supabase_auth_id',
        existing_type=sa.String(length=255),
        existing_nullable=True,
    )
    op.create_unique_constraint(
        'uq_users_supabase_auth_id',
        'users',
        ['supabase_auth_id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_users_supabase_auth_id', 'users', type_='unique')
    op.alter_column(
        'users',
        'supabase_auth_id',
        new_column_name='google_id',
        existing_type=sa.String(length=255),
        existing_nullable=True,
    )
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
