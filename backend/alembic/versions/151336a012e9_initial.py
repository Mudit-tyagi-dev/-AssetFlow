"""initial

Revision ID: 151336a012e9
Revises: 
Create Date: 2026-07-12 11:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '151336a012e9'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")

    # 2. Create Custom Enum Types in PG
    op.execute("CREATE TYPE org_status AS ENUM ('active', 'suspended')")
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'asset_manager', 'department_head', 'employee')")
    op.execute("CREATE TYPE user_status AS ENUM ('active', 'inactive')")
    op.execute("CREATE TYPE department_status AS ENUM ('active', 'inactive')")
    op.execute("CREATE TYPE asset_category_status AS ENUM ('active', 'inactive')")
    op.execute("CREATE TYPE asset_condition AS ENUM ('new', 'good', 'fair', 'poor', 'damaged')")
    op.execute("CREATE TYPE asset_status AS ENUM ('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed')")
    op.execute("CREATE TYPE holder_type AS ENUM ('employee', 'department')")
    op.execute("CREATE TYPE allocation_status AS ENUM ('active', 'returned', 'transferred')")
    op.execute("CREATE TYPE transfer_status AS ENUM ('requested', 'approved', 'rejected')")
    op.execute("CREATE TYPE booking_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled')")
    op.execute("CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical')")
    op.execute("CREATE TYPE maintenance_status AS ENUM ('pending', 'approved', 'rejected', 'technician_assigned', 'in_progress', 'resolved')")
    op.execute("CREATE TYPE audit_cycle_status AS ENUM ('draft', 'in_progress', 'closed')")
    op.execute("CREATE TYPE audit_item_status AS ENUM ('pending', 'verified', 'missing', 'damaged')")

    # 3. Create Organizations Table
    op.create_table(
        'organizations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('status', postgresql.ENUM('active', 'suspended', name='org_status', create_type=False), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )

    # 4. Create Departments Table
    op.create_table(
        'departments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('parent_department_id', sa.UUID(), nullable=True),
        sa.Column('department_head_id', sa.UUID(), nullable=True),
        sa.Column('status', postgresql.ENUM('active', 'inactive', name='department_status', create_type=False), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['parent_department_id'], ['departments.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('org_id', 'name', name='departments_org_id_name_key')
    )
    op.create_index('idx_departments_org', 'departments', ['org_id'])

    # 5. Create Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', postgresql.ENUM('admin', 'asset_manager', 'department_head', 'employee', name='user_role', create_type=False), server_default='employee', nullable=False),
        sa.Column('department_id', sa.UUID(), nullable=True),
        sa.Column('status', postgresql.ENUM('active', 'inactive', name='user_status', create_type=False), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('org_id', 'email', name='users_org_id_email_key')
    )
    op.create_index('idx_users_org', 'users', ['org_id'])
    op.create_index('idx_users_department', 'users', ['department_id'])

    # 6. Add Foreign Key for department_head_id on Departments table
    op.create_foreign_key('fk_departments_head', 'departments', 'users', ['department_head_id'], ['id'])
    op.create_index('idx_departments_head', 'departments', ['department_head_id'])

    # 7. Create Refresh Tokens Table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_refresh_tokens_user', 'refresh_tokens', ['user_id'])

    # 8. Create Asset Categories Table
    op.create_table(
        'asset_categories',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('custom_fields', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', postgresql.ENUM('active', 'inactive', name='asset_category_status', create_type=False), server_default='active', nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('org_id', 'name', name='asset_categories_org_id_name_key')
    )
    op.create_index('idx_asset_categories_org', 'asset_categories', ['org_id'])

    # 9. Create Assets Table
    op.create_table(
        'assets',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('asset_tag', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category_id', sa.UUID(), nullable=False),
        sa.Column('serial_number', sa.String(length=255), nullable=True),
        sa.Column('acquisition_date', sa.Date(), nullable=True),
        sa.Column('acquisition_cost', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('condition', postgresql.ENUM('new', 'good', 'fair', 'poor', 'damaged', name='asset_condition', create_type=False), server_default='good', nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('is_bookable', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('status', postgresql.ENUM('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed', name='asset_status', create_type=False), server_default='available', nullable=False),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('documents', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('current_holder_type', postgresql.ENUM('employee', 'department', name='holder_type', create_type=False), nullable=True),
        sa.Column('current_holder_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['asset_categories.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('org_id', 'asset_tag', name='assets_org_id_asset_tag_key')
    )
    op.create_index('idx_assets_org', 'assets', ['org_id'])
    op.create_index('idx_assets_category', 'assets', ['category_id'])
    op.create_index('idx_assets_status', 'assets', ['org_id', 'status'])
    op.create_index('uq_assets_org_serial', 'assets', ['org_id', 'serial_number'], unique=True, postgresql_where=sa.text('serial_number IS NOT NULL'))

    # 10. Create Asset Allocations Table
    op.create_table(
        'asset_allocations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('allocated_to_type', postgresql.ENUM('employee', 'department', name='holder_type', create_type=False), nullable=False),
        sa.Column('allocated_to_id', sa.UUID(), nullable=False),
        sa.Column('allocated_by_id', sa.UUID(), nullable=False),
        sa.Column('allocated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expected_return_date', sa.Date(), nullable=True),
        sa.Column('returned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('condition_check_in_notes', sa.Text(), nullable=True),
        sa.Column('status', postgresql.ENUM('active', 'returned', 'transferred', name='allocation_status', create_type=False), server_default='active', nullable=False),
        sa.ForeignKeyConstraint(['allocated_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_allocations_org', 'asset_allocations', ['org_id'])
    op.create_index('idx_allocations_asset', 'asset_allocations', ['asset_id', 'status'])
    op.create_index('uq_allocations_one_active_per_asset', 'asset_allocations', ['asset_id'], unique=True, postgresql_where=sa.text("status = 'active'"))

    # 11. Create Transfer Requests Table
    op.create_table(
        'transfer_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('requested_by_id', sa.UUID(), nullable=False),
        sa.Column('to_holder_type', postgresql.ENUM('employee', 'department', name='holder_type', create_type=False), nullable=False),
        sa.Column('to_holder_id', sa.UUID(), nullable=False),
        sa.Column('status', postgresql.ENUM('requested', 'approved', 'rejected', name='transfer_status', create_type=False), server_default='requested', nullable=False),
        sa.Column('approved_by_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['approved_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['requested_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transfers_org', 'transfer_requests', ['org_id'])
    op.create_index('idx_transfers_asset', 'transfer_requests', ['asset_id', 'status'])

    # 12. Create Resource Bookings Table
    op.create_table(
        'resource_bookings',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('booked_by_id', sa.UUID(), nullable=False),
        sa.Column('department_id', sa.UUID(), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', postgresql.ENUM('upcoming', 'ongoing', 'completed', 'cancelled', name='booking_status', create_type=False), server_default='upcoming', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('end_time > start_time', name='resource_bookings_check_end_time_after_start_time'),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['booked_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_bookings_org', 'resource_bookings', ['org_id'])
    op.create_index('idx_bookings_asset_time', 'resource_bookings', ['asset_id', 'start_time'])
    # Create exclusion constraint
    op.execute(
        "ALTER TABLE resource_bookings ADD CONSTRAINT resource_bookings_asset_time_exclude "
        "EXCLUDE USING gist (asset_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&) "
        "WHERE (status IN ('upcoming', 'ongoing'))"
    )

    # 13. Create Maintenance Requests Table
    op.create_table(
        'maintenance_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('raised_by_id', sa.UUID(), nullable=False),
        sa.Column('issue_description', sa.Text(), nullable=False),
        sa.Column('priority', postgresql.ENUM('low', 'medium', 'high', 'critical', name='maintenance_priority', create_type=False), server_default='medium', nullable=False),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'approved', 'rejected', 'technician_assigned', 'in_progress', 'resolved', name='maintenance_status', create_type=False), server_default='pending', nullable=False),
        sa.Column('approved_by_id', sa.UUID(), nullable=True),
        sa.Column('technician_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['approved_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['raised_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_maintenance_org', 'maintenance_requests', ['org_id'])
    op.create_index('idx_maintenance_asset', 'maintenance_requests', ['asset_id', 'status'])

    # 14. Create Audit Cycles Table
    op.create_table(
        'audit_cycles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('scope_department_id', sa.UUID(), nullable=True),
        sa.Column('scope_location', sa.String(length=255), nullable=True),
        sa.Column('date_range_start', sa.Date(), nullable=False),
        sa.Column('date_range_end', sa.Date(), nullable=False),
        sa.Column('status', postgresql.ENUM('draft', 'in_progress', 'closed', name='audit_cycle_status', create_type=False), server_default='draft', nullable=False),
        sa.Column('created_by_id', sa.UUID(), nullable=False),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['scope_department_id'], ['departments.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_cycles_org', 'audit_cycles', ['org_id'])

    # 15. Create Audit Cycle Auditors Table
    op.create_table(
        'audit_cycle_auditors',
        sa.Column('audit_cycle_id', sa.UUID(), nullable=False),
        sa.Column('auditor_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['audit_cycle_id'], ['audit_cycles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['auditor_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('audit_cycle_id', 'auditor_id')
    )

    # 16. Create Audit Items Table
    op.create_table(
        'audit_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('audit_cycle_id', sa.UUID(), nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('status', postgresql.ENUM('pending', 'verified', 'missing', 'damaged', name='audit_item_status', create_type=False), server_default='pending', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('verified_by_id', sa.UUID(), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['audit_cycle_id'], ['audit_cycles.id']),
        sa.ForeignKeyConstraint(['verified_by_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('audit_cycle_id', 'asset_id', name='audit_items_audit_cycle_id_asset_id_key')
    )
    op.create_index('idx_audit_items_cycle', 'audit_items', ['audit_cycle_id', 'status'])

    # 17. Create Notifications Table
    op.create_table(
        'notifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('type', sa.String(length=100), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('related_entity_type', sa.String(length=100), nullable=True),
        sa.Column('related_entity_id', sa.UUID(), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_notifications_user_unread', 'notifications', ['user_id', 'is_read'])

    # 18. Create Activity Logs Table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('org_id', sa.UUID(), nullable=False),
        sa.Column('actor_id', sa.UUID(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.UUID(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id']),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_activity_logs_org_time', 'activity_logs', ['org_id', 'created_at'])


def downgrade() -> None:
    # Drop in reverse order
    op.drop_table('activity_logs')
    op.drop_table('notifications')
    op.drop_table('audit_items')
    op.drop_table('audit_cycle_auditors')
    op.drop_table('audit_cycles')
    op.drop_table('maintenance_requests')
    op.drop_table('resource_bookings')
    op.drop_table('transfer_requests')
    op.drop_table('asset_allocations')
    op.drop_table('assets')
    op.drop_table('asset_categories')
    op.drop_table('refresh_tokens')
    
    # Remove FK from departments before dropping users
    op.drop_constraint('fk_departments_head', 'departments', type_='foreignkey')
    op.drop_table('users')
    op.drop_table('departments')
    op.drop_table('organizations')

    # Drop custom enums
    op.execute("DROP TYPE IF EXISTS audit_item_status")
    op.execute("DROP TYPE IF EXISTS audit_cycle_status")
    op.execute("DROP TYPE IF EXISTS maintenance_status")
    op.execute("DROP TYPE IF EXISTS maintenance_priority")
    op.execute("DROP TYPE IF EXISTS booking_status")
    op.execute("DROP TYPE IF EXISTS transfer_status")
    op.execute("DROP TYPE IF EXISTS allocation_status")
    op.execute("DROP TYPE IF EXISTS holder_type")
    op.execute("DROP TYPE IF EXISTS asset_status")
    op.execute("DROP TYPE IF EXISTS asset_condition")
    op.execute("DROP TYPE IF EXISTS asset_category_status")
    op.execute("DROP TYPE IF EXISTS department_status")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS org_status")
    
    # Drop extension
    op.execute("DROP EXTENSION IF EXISTS btree_gist")
