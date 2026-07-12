import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, require_role, get_pagination
from app.models.user import User
from app.schemas.allocation import (
    AssetAllocationCreate,
    AssetAllocationReturn,
    AssetAllocationRead,
    TransferRequestCreate,
    TransferRequestUpdate,
    TransferRequestRead,
)
from app.schemas.base import PaginatedResponse
from app.services.allocation_service import AllocationService
from app.repositories.allocation import AssetAllocationRepository, TransferRequestRepository

router = APIRouter(prefix="/allocations", tags=["allocations"])

# --- Asset Allocations ---

@router.post("", response_model=AssetAllocationRead, status_code=status.HTTP_201_CREATED)
async def allocate_asset(
    req: AssetAllocationCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Checkout an asset to an employee or department (Admin/Asset Manager only)."""
    async with db.begin():
        allocation = await AllocationService.allocate_asset(db, org_id, req, current_user.id)
        return allocation

@router.get("", response_model=PaginatedResponse[AssetAllocationRead])
async def list_allocations(
    status: Optional[str] = Query(None, description="Filter by active, returned, transferred"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List allocations for the organization (Any authenticated user)."""
    limit, offset = pagination
    alloc_repo = AssetAllocationRepository(db)
    allocs = await alloc_repo.get_allocations_by_org(org_id, status, offset, limit)
    total = await alloc_repo.count_allocations_by_org(org_id, status)
    return PaginatedResponse(items=allocs, total=total, limit=limit, offset=offset)

@router.post("/return/{asset_id}", response_model=AssetAllocationRead)
async def return_asset(
    asset_id: uuid.UUID,
    req: AssetAllocationReturn,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Process check-in / return of a currently checked-out asset (Admin/Asset Manager only)."""
    async with db.begin():
        allocation = await AllocationService.return_asset(db, org_id, asset_id, req, current_user.id)
        return allocation

# --- Transfer Requests ---

@router.post("/transfers", response_model=TransferRequestRead, status_code=status.HTTP_201_CREATED)
async def request_transfer(
    req: TransferRequestCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request transfer of a currently allocated asset (Any authenticated user)."""
    async with db.begin():
        transfer = await AllocationService.request_transfer(db, org_id, req, current_user.id)
        return transfer

@router.get("/transfers", response_model=PaginatedResponse[TransferRequestRead])
async def list_transfers(
    status: Optional[str] = Query(None, description="Filter by requested, approved, rejected"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List transfer requests (Any authenticated user)."""
    limit, offset = pagination
    transfer_repo = TransferRequestRepository(db)
    transfers = await transfer_repo.get_transfers_by_org(org_id, status, offset, limit)
    total = await transfer_repo.count_transfers_by_org(org_id, status)
    return PaginatedResponse(items=transfers, total=total, limit=limit, offset=offset)

@router.put("/transfers/{id}", response_model=TransferRequestRead)
async def resolve_transfer(
    id: uuid.UUID,
    req: TransferRequestUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject an asset transfer request (Admin/Asset Manager only). Re-allocates asset atomically on approval."""
    async with db.begin():
        transfer = await AllocationService.resolve_transfer(db, org_id, id, req, current_user.id)
        return transfer
