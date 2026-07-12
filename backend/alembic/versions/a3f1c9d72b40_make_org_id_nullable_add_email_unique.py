"""make org_id nullable and global email unique

Revision ID: a3f1c9d72b40
Revises: 151336a012e9
Create Date: 2026-07-12 14:00:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a3f1c9d72b40'
down_revision = '151336a012e9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Drop the old (org_id, email) unique constraint
    op.drop_constraint('users_org_id_email_key', 'users', type_='unique')

    # 2. Drop the FK constraint on org_id so we can make it nullable
    op.drop_constraint('users_org_id_fkey', 'users', type_='foreignkey')

    # 3. Make org_id nullable
    op.alter_column('users', 'org_id', nullable=True)

    # 4. Re-add the FK with ondelete=SET NULL so deleting an org nullifies user.org_id
    op.create_foreign_key(
        'users_org_id_fkey',
        'users', 'organizations',
        ['org_id'], ['id'],
        ondelete='SET NULL'
    )

    # 5. Add a global unique constraint on email (each email can only sign up once)
    op.create_unique_constraint('users_email_key', 'users', ['email'])


def downgrade() -> None:
    # Reverse: drop global email unique
    op.drop_constraint('users_email_key', 'users', type_='unique')

    # Drop new FK
    op.drop_constraint('users_org_id_fkey', 'users', type_='foreignkey')

    # Make org_id non-nullable again (will fail if any NULL rows exist)
    op.alter_column('users', 'org_id', nullable=False)

    # Restore old FK
    op.create_foreign_key(
        'users_org_id_fkey',
        'users', 'organizations',
        ['org_id'], ['id']
    )

    # Restore old (org_id, email) unique constraint
    op.create_unique_constraint('users_org_id_email_key', 'users', ['org_id', 'email'])
