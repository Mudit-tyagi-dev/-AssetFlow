import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError, InvalidStateTransitionError
from app.models.asset import Asset, AssetCategory
from app.models.enums import AssetStatus, AssetCondition
from app.repositories.asset import AssetRepository, AssetCategoryRepository
from app.schemas.asset import AssetCreate, AssetUpdate
from app.services.utils import log_activity

# Strict lifecycle transitions map
ALLOWED_TRANSITIONS = {
    AssetStatus.available: {AssetStatus.allocated, AssetStatus.reserved, AssetStatus.under_maintenance, AssetStatus.retired},
    AssetStatus.allocated: {AssetStatus.available, AssetStatus.under_maintenance, AssetStatus.lost},
    AssetStatus.reserved: {AssetStatus.available, AssetStatus.allocated, AssetStatus.under_maintenance, AssetStatus.retired, AssetStatus.lost},
    AssetStatus.under_maintenance: {AssetStatus.available, AssetStatus.retired, AssetStatus.disposed},
    AssetStatus.lost: {AssetStatus.available, AssetStatus.retired, AssetStatus.disposed},
    AssetStatus.retired: set(),
    AssetStatus.disposed: set()
}

class AssetService:
    @staticmethod
    def validate_transition(old_status: AssetStatus, new_status: AssetStatus):
        if old_status == new_status:
            return
        allowed = ALLOWED_TRANSITIONS.get(old_status, set())
        if new_status not in allowed:
            raise InvalidStateTransitionError(
                f"Transition from {old_status.value} to {new_status.value} is not allowed."
            )

    @staticmethod
    async def create_asset(db: AsyncSession, org_id: uuid.UUID, req: AssetCreate, actor_id: uuid.UUID) -> Asset:
        cat_repo = AssetCategoryRepository(db)
        asset_repo = AssetRepository(db)

        # Validate category
        category = await cat_repo.get_by_id_and_org(req.category_id, org_id)
        if not category:
            raise NotFoundError("Asset category not found.")
        if category.status != "active":
            raise ConflictError("Asset category is inactive.")

        # Check serial number uniqueness if provided
        if req.serial_number:
            existing_serial = await asset_repo.get_by_serial(req.serial_number, org_id)
            if existing_serial:
                raise ConflictError(f"Asset with serial number '{req.serial_number}' already exists in this organization.")

        # Auto-generate sequential asset tag
        tag = await asset_repo.get_next_tag(org_id)

        asset = Asset(
            id=uuid.UUID(bytes=uuid7().bytes), # Force uuid7
            org_id=org_id,
            asset_tag=tag,
            name=req.name,
            category_id=req.category_id,
            serial_number=req.serial_number,
            acquisition_date=req.acquisition_date,
            acquisition_cost=req.acquisition_cost,
            condition=req.condition or AssetCondition.good,
            location=req.location,
            is_bookable=req.is_bookable,
            status=AssetStatus.available,
            documents=[]
        )
        db.add(asset)
        await db.flush()

        await log_activity(
            db, org_id, actor_id, "create_asset", "asset", asset.id, {"tag": tag, "name": req.name}
        )
        return asset

    @staticmethod
    async def update_asset(
        db: AsyncSession, org_id: uuid.UUID, asset_id: uuid.UUID, req: AssetUpdate, actor_id: uuid.UUID
    ) -> Asset:
        asset_repo = AssetRepository(db)
        
        # Row-level lock the asset inside transaction
        asset = await asset_repo.get_by_id_and_org(asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        update_dict = req.model_dump(exclude_unset=True)

        # If changing category
        if "category_id" in update_dict and update_dict["category_id"] != asset.category_id:
            cat_repo = AssetCategoryRepository(db)
            category = await cat_repo.get_by_id_and_org(update_dict["category_id"], org_id)
            if not category:
                raise NotFoundError("Asset category not found.")
            if category.status != "active":
                raise ConflictError("Asset category is inactive.")

        # If changing serial number
        if "serial_number" in update_dict and update_dict["serial_number"] != asset.serial_number:
            if update_dict["serial_number"]:
                existing_serial = await asset_repo.get_by_serial(update_dict["serial_number"], org_id)
                if existing_serial:
                    raise ConflictError(
                        f"Asset with serial number '{update_dict['serial_number']}' already exists in this organization."
                    )

        # If changing status, validate state machine
        if "status" in update_dict and update_dict["status"] != asset.status:
            new_status = update_dict["status"]
            AssetService.validate_transition(asset.status, new_status)

        for field, value in update_dict.items():
            setattr(asset, field, value)

        await db.flush()
        await log_activity(db, org_id, actor_id, "update_asset", "asset", asset.id, update_dict)
        return asset

    @staticmethod
    async def delete_asset(db: AsyncSession, org_id: uuid.UUID, asset_id: uuid.UUID, actor_id: uuid.UUID) -> None:
        asset_repo = AssetRepository(db)
        asset = await asset_repo.get_by_id_and_org(asset_id, org_id)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Cannot delete if allocated or reserved or under maintenance
        if asset.status in (AssetStatus.allocated, AssetStatus.reserved, AssetStatus.under_maintenance):
            raise ConflictError(f"Cannot delete asset that is currently {asset.status.value}.")

        # Check if asset has allocation history
        from app.models.allocation import AssetAllocation
        from sqlalchemy import func
        alloc_count_stmt = select(func.count()).select_from(AssetAllocation).where(
            AssetAllocation.asset_id == asset.id
        )
        history_count = (await db.execute(alloc_count_stmt)).scalar() or 0
        if history_count > 0:
            raise ConflictError("Cannot delete asset that has historical allocations. Move to 'retired' or 'disposed' status instead.")

        await asset_repo.remove(asset.id)
        await log_activity(db, org_id, actor_id, "delete_asset", "asset", asset.id, {"tag": asset.asset_tag})
