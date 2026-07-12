import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, require_role, get_pagination
from app.models.user import User
from app.schemas.maintenance import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestRead,
)
from app.schemas.base import PaginatedResponse
from app.services.maintenance_service import MaintenanceService
from app.repositories.maintenance import MaintenanceRequestRepository

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("", response_model=MaintenanceRequestRead, status_code=status.HTTP_201_CREATED)
async def raise_maintenance_request(
    req: MaintenanceRequestCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Raise a new maintenance request for an asset."""
    async with db.begin():
        request = await MaintenanceService.raise_request(db, org_id, req, current_user.id)
        return request

@router.get("", response_model=PaginatedResponse[MaintenanceRequestRead])
async def list_maintenance_requests(
    status: Optional[str] = Query(None, description="Filter by pending, approved, rejected, technician_assigned, in_progress, resolved"),
    priority: Optional[str] = Query(None, description="Filter by low, medium, high, critical"),
    asset_id: Optional[uuid.UUID] = Query(None),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List and filter maintenance requests."""
    limit, offset = pagination
    maint_repo = MaintenanceRequestRepository(db)
    requests = await maint_repo.get_maintenance_by_org(org_id, status, priority, asset_id, offset, limit)
    total = await maint_repo.count_maintenance_by_org(org_id, status, priority, asset_id)
    return PaginatedResponse(items=requests, total=total, limit=limit, offset=offset)

@router.post("/{id}/approve", response_model=MaintenanceRequestRead)
async def approve_maintenance_request(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Approve maintenance request (Admin/Asset Manager only). Flips asset status to 'under_maintenance'."""
    async with db.begin():
        request = await MaintenanceService.approve_request(db, org_id, id, current_user.id)
        return request

@router.post("/{id}/reject", response_model=MaintenanceRequestRead)
async def reject_maintenance_request(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Reject maintenance request (Admin/Asset Manager only)."""
    async with db.begin():
        request = await MaintenanceService.reject_request(db, org_id, id, current_user.id)
        return request

@router.put("/{id}/assign", response_model=MaintenanceRequestRead)
async def assign_technician(
    id: uuid.UUID,
    req: MaintenanceRequestUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Assign a technician or update in-progress status (Admin/Asset Manager only)."""
    async with db.begin():
        request = await MaintenanceService.assign_technician(db, org_id, id, req, current_user.id)
        return request

@router.post("/{id}/resolve", response_model=MaintenanceRequestRead)
async def resolve_maintenance_request(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Mark maintenance resolved (Admin/Asset Manager only). Flips asset status back to 'available'."""
    async with db.begin():
        request = await MaintenanceService.resolve_request(db, org_id, id, current_user.id)
        return request
