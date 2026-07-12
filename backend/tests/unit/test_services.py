import pytest
from datetime import datetime, date, timedelta, timezone
from sqlalchemy import select
from app.core.uuid import uuid7

from app.core.exceptions import ConflictError, AssetAlreadyAllocatedError, BookingOverlapError, InvalidStateTransitionError
from app.models.enums import AssetStatus, HolderType, AllocationStatus, BookingStatus, MaintenanceStatus, AuditItemStatus, AuditCycleStatus
from app.models.asset import Asset, AssetCategory
from app.models.allocation import AssetAllocation
from app.models.booking import ResourceBooking
from app.models.maintenance import MaintenanceRequest
from app.models.audit import AuditCycle, AuditItem

from app.schemas.asset import AssetCreate, AssetUpdate
from app.schemas.allocation import AssetAllocationCreate, AssetAllocationReturn, TransferRequestCreate, TransferRequestUpdate
from app.schemas.booking import ResourceBookingCreate, ResourceBookingUpdate
from app.schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate
from app.schemas.audit import AuditCycleCreate, AuditItemUpdate

from app.services.asset_service import AssetService
from app.services.allocation_service import AllocationService
from app.services.booking_service import BookingService
from app.services.maintenance_service import MaintenanceService
from app.services.audit_service import AuditService

@pytest.mark.anyio
async def test_asset_lifecycle_transitions():
    # Test valid transitions
    AssetService.validate_transition(AssetStatus.available, AssetStatus.allocated)
    AssetService.validate_transition(AssetStatus.allocated, AssetStatus.available)
    AssetService.validate_transition(AssetStatus.available, AssetStatus.under_maintenance)
    AssetService.validate_transition(AssetStatus.under_maintenance, AssetStatus.available)

    # Test invalid transition (raises InvalidStateTransitionError)
    with pytest.raises(InvalidStateTransitionError):
        AssetService.validate_transition(AssetStatus.allocated, AssetStatus.disposed)

@pytest.mark.anyio
async def test_asset_creation_and_tagging(db_session, seed_data):
    org = seed_data["org_a"]
    admin = seed_data["admin_a"]
    cat = seed_data["dept_a"] # use dept_a to represent category or create category
    
    # Create category first
    cat_it = AssetCategory(id=uuid7(), org_id=org.id, name="IT Devices", status="active")
    db_session.add(cat_it)
    await db_session.flush()

    req = AssetCreate(
        name="Test Laptop",
        category_id=cat_it.id,
        serial_number="TEST-LAPTOP-SN",
        acquisition_date=date.today(),
        acquisition_cost=1000.0,
        is_bookable=False
    )
    
    asset = await AssetService.create_asset(db_session, org.id, req, admin.id)
    assert asset.asset_tag == "AF-0001"
    assert asset.status == AssetStatus.available

@pytest.mark.anyio
async def test_allocation_concurrency_conflict(db_session, seed_data):
    org = seed_data["org_a"]
    admin = seed_data["admin_a"]
    emp = seed_data["employee_a"]

    # Seed an available asset
    cat = AssetCategory(id=uuid7(), org_id=org.id, name="IT Devices", status="active")
    db_session.add(cat)
    await db_session.flush()

    asset = Asset(
        id=uuid7(), org_id=org.id, asset_tag="AF-100", name="Device X",
        category_id=cat.id, status=AssetStatus.available, is_bookable=False
    )
    db_session.add(asset)
    await db_session.flush()

    # First allocation
    req = AssetAllocationCreate(
        asset_id=asset.id,
        allocated_to_type=HolderType.employee,
        allocated_to_id=emp.id
    )
    await AllocationService.allocate_asset(db_session, org.id, req, admin.id)
    assert asset.status == AssetStatus.allocated

    # Second allocation attempt (raises AssetAlreadyAllocatedError)
    with pytest.raises(AssetAlreadyAllocatedError) as exc_info:
        await AllocationService.allocate_asset(db_session, org.id, req, admin.id)
    
    assert exc_info.value.code == "ASSET_ALREADY_ALLOCATED"
    assert exc_info.value.details["current_holder_name"] == emp.name

@pytest.mark.anyio
async def test_booking_overlap_validation(db_session, seed_data):
    org = seed_data["org_a"]
    emp = seed_data["employee_a"]

    cat = AssetCategory(id=uuid7(), org_id=org.id, name="IT Devices", status="active")
    db_session.add(cat)
    await db_session.flush()

    asset = Asset(
        id=uuid7(), org_id=org.id, asset_tag="AF-200", name="Projector X",
        category_id=cat.id, status=AssetStatus.available, is_bookable=True
    )
    db_session.add(asset)
    await db_session.flush()

    start = datetime.now(timezone.utc) + timedelta(hours=1)
    end = start + timedelta(hours=1)

    # First booking
    req1 = ResourceBookingCreate(asset_id=asset.id, start_time=start, end_time=end)
    await BookingService.create_booking(db_session, org.id, req1, emp.id)

    # Overlapping booking attempt
    req2 = ResourceBookingCreate(
        asset_id=asset.id,
        start_time=start + timedelta(minutes=30),
        end_time=end + timedelta(minutes=30)
    )
    with pytest.raises(BookingOverlapError):
        await BookingService.create_booking(db_session, org.id, req2, emp.id)

@pytest.mark.anyio
async def test_maintenance_resolution_workflow(db_session, seed_data):
    org = seed_data["org_a"]
    admin = seed_data["admin_a"]
    emp = seed_data["employee_a"]

    cat = AssetCategory(id=uuid7(), org_id=org.id, name="IT Devices", status="active")
    db_session.add(cat)
    await db_session.flush()

    asset = Asset(
        id=uuid7(), org_id=org.id, asset_tag="AF-300", name="Device Z",
        category_id=cat.id, status=AssetStatus.available, is_bookable=False
    )
    db_session.add(asset)
    await db_session.flush()

    # Raise request
    req = MaintenanceRequestCreate(asset_id=asset.id, issue_description="Broken Screen")
    maint = await MaintenanceService.raise_request(db_session, org.id, req, emp.id)
    assert maint.status == MaintenanceStatus.pending
    assert asset.status == AssetStatus.available

    # Approve request
    await MaintenanceService.approve_request(db_session, org.id, maint.id, admin.id)
    assert maint.status == MaintenanceStatus.approved
    assert asset.status == AssetStatus.under_maintenance

    # Assign technician & start
    update_req = MaintenanceRequestUpdate(technician_name="Fixer Joe")
    await MaintenanceService.assign_technician(db_session, org.id, maint.id, update_req, admin.id)
    maint.status = MaintenanceStatus.in_progress # transition manually or via assign
    
    # Resolve request
    await MaintenanceService.resolve_request(db_session, org.id, maint.id, admin.id)
    assert maint.status == MaintenanceStatus.resolved
    assert asset.status == AssetStatus.available

@pytest.mark.anyio
async def test_audit_cycle_closure_auto_updates(db_session, seed_data):
    org = seed_data["org_a"]
    admin = seed_data["admin_a"]
    emp = seed_data["employee_a"]

    cat = AssetCategory(id=uuid7(), org_id=org.id, name="IT Devices", status="active")
    db_session.add(cat)
    await db_session.flush()

    asset1 = Asset(id=uuid7(), org_id=org.id, asset_tag="AF-401", name="Asset 1", category_id=cat.id)
    asset2 = Asset(id=uuid7(), org_id=org.id, asset_tag="AF-402", name="Asset 2", category_id=cat.id)
    db_session.add_all([asset1, asset2])
    await db_session.flush()

    # Create cycle
    req = AuditCycleCreate(
        date_range_start=date.today(),
        date_range_end=date.today() + timedelta(days=1),
        auditor_ids=[emp.id]
    )
    cycle = await AuditService.create_cycle(db_session, org.id, req, admin.id)
    await AuditService.start_cycle(db_session, org.id, cycle.id, admin.id)

    # Fetch audit items
    stmt = select(AuditItem).where(AuditItem.audit_cycle_id == cycle.id)
    items = (await db_session.execute(stmt)).scalars().all()
    assert len(items) == 2

    # Verify item 1 as missing, item 2 as damaged
    item_missing = [it for it in items if it.asset_id == asset1.id][0]
    item_damaged = [it for it in items if it.asset_id == asset2.id][0]

    await AuditService.verify_item(db_session, org.id, cycle.id, item_missing.id, AuditItemUpdate(status=AuditItemStatus.missing), emp.id)
    await AuditService.verify_item(db_session, org.id, cycle.id, item_damaged.id, AuditItemUpdate(status=AuditItemStatus.damaged, notes="Bent body"), emp.id)

    # Close cycle
    await AuditService.close_cycle(db_session, org.id, cycle.id, admin.id)

    # Assert asset 1 is lost
    assert asset1.status == AssetStatus.lost

    # Assert asset 2 is under maintenance
    assert asset2.status == AssetStatus.under_maintenance

    # Assert maintenance request was auto-created for asset 2
    stmt_maint = select(MaintenanceRequest).where(MaintenanceRequest.asset_id == asset2.id)
    maint_req = (await db_session.execute(stmt_maint)).scalars().first()
    assert maint_req is not None
    assert maint_req.status == MaintenanceStatus.pending
    assert "Bent body" in maint_req.issue_description
