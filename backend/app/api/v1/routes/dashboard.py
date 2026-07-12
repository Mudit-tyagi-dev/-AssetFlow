from datetime import date
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user
from app.models.user import User
from app.models.asset import Asset
from app.models.allocation import AssetAllocation, TransferRequest
from app.models.booking import ResourceBooking
from app.models.maintenance import MaintenanceRequest
from app.models.enums import AssetStatus, BookingStatus, AllocationStatus, TransferStatus, MaintenanceStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_dashboard_summary(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve aggregate counts (KPIs) for the current organization's dashboard."""
    # Available assets count
    avail_stmt = select(func.count()).select_from(Asset).where(
        Asset.org_id == org_id, Asset.status == AssetStatus.available
    )
    avail_count = (await db.execute(avail_stmt)).scalar() or 0

    # Allocated assets count
    allocated_stmt = select(func.count()).select_from(Asset).where(
        Asset.org_id == org_id, Asset.status == AssetStatus.allocated
    )
    allocated_count = (await db.execute(allocated_stmt)).scalar() or 0

    # Active maintenance requests
    maint_stmt = select(func.count()).select_from(MaintenanceRequest).where(
        MaintenanceRequest.org_id == org_id,
        MaintenanceRequest.status.notin_([MaintenanceStatus.resolved, MaintenanceStatus.rejected])
    )
    maint_count = (await db.execute(maint_stmt)).scalar() or 0

    # Active/Ongoing bookings
    booking_stmt = select(func.count()).select_from(ResourceBooking).where(
        ResourceBooking.org_id == org_id,
        ResourceBooking.status == BookingStatus.ongoing
    )
    booking_count = (await db.execute(booking_stmt)).scalar() or 0

    # Pending transfers
    transfer_stmt = select(func.count()).select_from(TransferRequest).where(
        TransferRequest.org_id == org_id,
        TransferRequest.status == TransferStatus.requested
    )
    transfer_count = (await db.execute(transfer_stmt)).scalar() or 0

    # Overdue returns: active allocations with expected return date < today
    today = date.today()
    overdue_stmt = select(func.count()).select_from(AssetAllocation).where(
        AssetAllocation.org_id == org_id,
        AssetAllocation.status == AllocationStatus.active,
        AssetAllocation.expected_return_date < today,
        AssetAllocation.returned_at.is_(None)
    )
    overdue_count = (await db.execute(overdue_stmt)).scalar() or 0

    return {
        "kpis": {
            "available_assets": avail_count,
            "allocated_assets": allocated_count,
            "maintenance_active": maint_count,
            "active_bookings": booking_count,
            "pending_transfers": transfer_count,
            "overdue_returns": overdue_count,
        }
    }
