import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, require_role, get_pagination
from app.models.user import User
from app.schemas.asset import (
    AssetCreate,
    AssetUpdate,
    AssetRead,
    AssetHistoryRead,
)
from app.schemas.base import PaginatedResponse
from app.services.asset_service import AssetService
from app.services.storage_service import storage_service
from app.repositories.asset import AssetRepository

router = APIRouter(prefix="/assets", tags=["assets"])

@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
async def create_asset(
    req: AssetCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Register a new Asset (Admin and Asset Manager only)."""
    async with db.begin():
        asset = await AssetService.create_asset(db, org_id, req, current_user.id)
        return asset

@router.get("", response_model=PaginatedResponse[AssetRead])
async def list_assets(
    search: Optional[str] = Query(None, description="Search by name, tag, or serial"),
    category_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    department_id: Optional[uuid.UUID] = Query(None),
    location: Optional[str] = Query(None),
    is_bookable: Optional[bool] = Query(None),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List and filter assets within the organization."""
    limit, offset = pagination
    asset_repo = AssetRepository(db)
    assets = await asset_repo.filter_assets(
        org_id, search, category_id, status, department_id, location, is_bookable, offset, limit
    )
    total = await asset_repo.count_filtered_assets(
        org_id, search, category_id, status, department_id, location, is_bookable
    )
    return PaginatedResponse(items=assets, total=total, limit=limit, offset=offset)

@router.get("/{id}", response_model=AssetRead)
async def get_asset(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve an asset by ID."""
    asset_repo = AssetRepository(db)
    asset = await asset_repo.get_by_id_and_org(id, org_id)
    if not asset:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Asset not found.")
    return asset

@router.put("/{id}", response_model=AssetRead)
async def update_asset(
    id: uuid.UUID,
    req: AssetUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Update an Asset (Admin and Asset Manager only). Supports lifecycle status transitions."""
    async with db.begin():
        asset = await AssetService.update_asset(db, org_id, id, req, current_user.id)
        return asset

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_asset(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Delete an Asset (Admin and Asset Manager only). Prevented if allocated/reserved."""
    async with db.begin():
        await AssetService.delete_asset(db, org_id, id, current_user.id)
        return {"message": "Asset deleted successfully."}

@router.get("/{id}/history", response_model=List[AssetHistoryRead])
async def get_asset_history(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager", "department_head")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the chronological allocation and maintenance history for an asset (Admin, Manager, Dept Head only)."""
    asset_repo = AssetRepository(db)
    history = await asset_repo.get_asset_history(id, org_id)
    return history

@router.post("/presigned-url")
async def generate_presigned_upload_url(
    filename: str,
    mime_type: str,
    current_user: User = Depends(get_current_user)
):
    """Generate a presigned S3 POST URL (or local disk stub fallback) to upload file attachments."""
    return storage_service.generate_upload_url(filename, mime_type)
