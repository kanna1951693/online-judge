"""auth_google_profile

Revision ID: c28c894e6377
Revises: 963cb668e785
Create Date: 2026-06-25 09:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c28c894e6377'
down_revision: Union[str, Sequence[str], None] = '963cb668e785'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add google_id column
    op.add_column('users', sa.Column('google_id', sa.String(length=255), nullable=True))
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])

    # Add profile_hash column with auto-generated default
    op.add_column('users', sa.Column(
        'profile_hash', sa.String(length=64), nullable=False,
        server_default=sa.text("replace(gen_random_uuid()::text, '-', '')")
    ))
    op.create_unique_constraint('uq_users_profile_hash', 'users', ['profile_hash'])

    # Make password_hash nullable (for Google-only auth users)
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(length=255),
                    nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(length=255),
                    nullable=False)
    op.drop_constraint('uq_users_profile_hash', 'users', type_='unique')
    op.drop_column('users', 'profile_hash')
    op.drop_constraint('uq_users_google_id', 'users', type_='unique')
    op.drop_column('users', 'google_id')
