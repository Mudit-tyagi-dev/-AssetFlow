import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, require_role, get_pagination
from app.models.user import User
from app.schemas.audit import (
    AuditCycleCreate,
    AuditCycleRead,
    AuditItemUpdate,
    AuditItemRead,
)
from app.schemas.base import PaginatedResponse
from app.services.audit_service import AuditService
from app.repositories.audit import AuditCycleRepository, AuditItemRepository

router = APIRouter(prefix="/audits", tags=["audits"])

@router.post("", response_model=AuditCycleRead, status_code=status.HTTP_201_CREATED)
async def create_audit_cycle(
    req: AuditCycleCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new Audit Cycle (Admin/Asset Manager only). Auto-populates items based on scope."""
    async with db.begin():
        cycle = await AuditService.create_cycle(db, org_id, req, current_user.id)
        return cycle

@router.get("", response_model=PaginatedResponse[AuditCycleRead])
async def list_audit_cycles(
    status: Optional[str] = Query(None, description="Filter by draft, in_progress, closed"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """List audit cycles for the organization (Admin, Manager, Dept Head only)."""
    limit, offset = pagination
    cycle_repo = AuditCycleRepository(db)
    cycles = await cycle_repo.get_audit_cycles_by_org(org_id, status, offset, limit)
    total = await cycle_repo.count_audit_cycles_by_org(org_id, status)
    return PaginatedResponse(items=cycles, total=total, limit=limit, offset=offset)

@router.post("/{id}/start", response_model=AuditCycleRead)
async def start_audit_cycle(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Start a draft audit cycle, transitioning status to 'in_progress' and notifying auditors (Admin/Manager only)."""
    async with db.begin():
        cycle = await AuditService.start_cycle(db, org_id, id, current_user.id)
        return cycle

@router.get("/{id}/items", response_model=PaginatedResponse[AuditItemRead])
async def list_audit_items(
    id: uuid.UUID,
    status: Optional[str] = Query(None, description="Filter by pending, verified, missing, damaged"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head", "employee")),
    db: AsyncSession = Depends(get_db)
):
    """List items belonging to an audit cycle."""
    limit, offset = pagination
    # Check if cycle exists in org
    cycle_repo = AuditCycleRepository(db)
    cycle = await cycle_repo.get_by_id_and_org(id, org_id)
    if not cycle:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Audit cycle not found.")

    item_repo = AuditItemRepository(db)
    items = await item_repo.get_items_by_cycle(id, status, offset, limit)
    total = await item_repo.count_items_by_cycle(id, status)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)

@router.put("/{id}/items/{item_id}", response_model=AuditItemRead)
async def verify_audit_item(
    id: uuid.UUID,
    item_id: uuid.UUID,
    req: AuditItemUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify an item within an active audit cycle (Assigned Auditors or Admin only)."""
    async with db.begin():
        item = await AuditService.verify_item(db, org_id, id, item_id, req, current_user.id)
        return item

@router.post("/{id}/close", response_model=AuditCycleRead)
async def close_audit_cycle(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Close an audit cycle irreversibly. Missing items mark assets lost; damaged items mark assets under_maintenance and auto-create maintenance requests."""
    async with db.begin():
        cycle = await AuditService.close_cycle(db, org_id, id, current_user.id)
        return cycle
