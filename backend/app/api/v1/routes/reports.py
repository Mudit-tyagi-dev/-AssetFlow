import csv
import io
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.db import get_db
from app.api.v1.deps import get_current_org, require_role
from app.models.user import User
from app.models.asset import Asset, AssetCategory
from app.models.org import Department
from app.models.booking import ResourceBooking
from app.models.maintenance import MaintenanceRequest
from app.models.enums import AssetStatus, BookingStatus, MaintenanceStatus

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/utilization")
async def get_utilization_trends(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve organization-wide asset utilization metrics (allocated vs total assets)."""
    total_stmt = select(func.count()).select_from(Asset).where(
        Asset.org_id == org_id,
        Asset.status != AssetStatus.disposed
    )
    total_assets = (await db.execute(total_stmt)).scalar() or 0

    allocated_stmt = select(func.count()).select_from(Asset).where(
        Asset.org_id == org_id,
        Asset.status == AssetStatus.allocated
    )
    allocated_assets = (await db.execute(allocated_stmt)).scalar() or 0

    utilization_rate = (allocated_assets / total_assets * 100) if total_assets > 0 else 0.0

    return {
        "total_assets": total_assets,
        "allocated_assets": allocated_assets,
        "utilization_rate": round(utilization_rate, 2)
    }

@router.get("/maintenance-frequency")
async def get_maintenance_frequency(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve list of assets with the highest maintenance request frequencies."""
    stmt = select(
        Asset.asset_tag,
        Asset.name,
        func.count(MaintenanceRequest.id).label("request_count")
    ).join(
        MaintenanceRequest, Asset.id == MaintenanceRequest.asset_id
    ).where(
        Asset.org_id == org_id
    ).group_by(
        Asset.id, Asset.asset_tag, Asset.name
    ).order_by(
        desc("request_count")
    ).limit(10)

    result = await db.execute(stmt)
    records = []
    for tag, name, count in result.all():
        records.append({"asset_tag": tag, "asset_name": name, "maintenance_count": count})
    return records

@router.get("/department-allocations")
async def get_department_allocations(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve allocation summary statistics aggregated by department."""
    stmt = select(
        Department.name,
        func.count(Asset.id).label("asset_count")
    ).join(
        Asset, (Asset.current_holder_id == Department.id) & (Asset.current_holder_type == "department")
    ).where(
        Department.org_id == org_id
    ).group_by(
        Department.id, Department.name
    ).order_by(
        desc("asset_count")
    )

    result = await db.execute(stmt)
    records = []
    for dept_name, count in result.all():
        records.append({"department_name": dept_name, "allocated_assets_count": count})
    return records

@router.get("/booking-heatmap")
async def get_booking_heatmap(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve booking counts grouped by hour of day to show utilization heatmaps."""
    # To be compatible with SQLite/Postgres in tests, we can parse booking dates in Python or extract using SQL.
    # Python-based group by is safer to ensure it works on both SQLite and Postgres.
    stmt = select(ResourceBooking.start_time).where(
        ResourceBooking.org_id == org_id,
        ResourceBooking.status.in_([BookingStatus.upcoming, BookingStatus.ongoing, BookingStatus.completed])
    )
    result = await db.execute(stmt)
    times = result.scalars().all()

    heatmap = {hour: 0 for hour in range(24)}
    for t in times:
        heatmap[t.hour] += 1

    return [{"hour": hour, "bookings_count": count} for hour, count in heatmap.items()]

@router.get("/export-assets")
async def export_assets_csv(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Export the complete assets listing as a CSV stream (Admin & Asset Manager only)."""
    stmt = select(
        Asset.asset_tag,
        Asset.name,
        AssetCategory.name.label("category_name"),
        Asset.serial_number,
        Asset.condition,
        Asset.status,
        Asset.location
    ).join(
        AssetCategory, Asset.category_id == AssetCategory.id
    ).where(
        Asset.org_id == org_id
    ).order_by(Asset.asset_tag.asc())

    result = await db.execute(stmt)
    rows = result.all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Asset Tag", "Name", "Category", "Serial Number", "Condition", "Status", "Location"])
    
    # Write data
    for row in rows:
        writer.writerow([
            row.asset_tag,
            row.name,
            row.category_name,
            row.serial_number or "",
            row.condition.value,
            row.status.value,
            row.location or ""
        ])

    output.seek(0)
    
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    # Inline headers configuration
    response.headers["Content-Disposition"] = f"attachment; filename=assets_report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    return response
