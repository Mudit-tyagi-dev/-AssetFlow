from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy import select, func, or_
from app.repositories.base import BaseRepository
from app.models.asset import Asset, AssetCategory

class AssetCategoryRepository(BaseRepository[AssetCategory]):
    def __init__(self, db):
        super().__init__(AssetCategory, db)

    async def get_by_name(self, name: str, org_id: UUID) -> Optional[AssetCategory]:
        stmt = select(AssetCategory).where(AssetCategory.org_id == org_id, AssetCategory.name == name)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[AssetCategory]:
        stmt = select(AssetCategory).where(AssetCategory.id == id, AssetCategory.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def count_assets_in_category(self, category_id: UUID, org_id: UUID) -> int:
        stmt = select(func.count()).select_from(Asset).where(
            Asset.org_id == org_id,
            Asset.category_id == category_id,
            Asset.status != "disposed"
        )
        result = await self.db.execute(stmt)
        return result.scalar() or 0


class AssetRepository(BaseRepository[Asset]):
    def __init__(self, db):
        super().__init__(Asset, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID, lock: bool = False) -> Optional[Asset]:
        stmt = select(Asset).where(Asset.id == id, Asset.org_id == org_id)
        if lock:
            stmt = stmt.with_for_update()
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_tag(self, asset_tag: str, org_id: UUID) -> Optional[Asset]:
        stmt = select(Asset).where(Asset.org_id == org_id, Asset.asset_tag == asset_tag)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_serial(self, serial_number: str, org_id: UUID) -> Optional[Asset]:
        stmt = select(Asset).where(Asset.org_id == org_id, Asset.serial_number == serial_number)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_next_tag(self, org_id: UUID) -> str:
        # Load all tags for this org to determine next number (compatible with SQLite/Postgres)
        stmt = select(Asset.asset_tag).where(Asset.org_id == org_id)
        res = await self.db.execute(stmt)
        tags = res.scalars().all()
        
        max_num = 0
        for tag in tags:
            if "-" in tag:
                try:
                    num = int(tag.split("-")[-1])
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
        next_num = max_num + 1
        return f"AF-{next_num:04d}"

    async def filter_assets(
        self,
        org_id: UUID,
        search: Optional[str] = None,
        category_id: Optional[UUID] = None,
        status: Optional[str] = None,
        department_id: Optional[UUID] = None,
        location: Optional[str] = None,
        is_bookable: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[Asset]:
        stmt = select(Asset).where(Asset.org_id == org_id)
        
        if search:
            stmt = stmt.where(
                or_(
                    Asset.name.ilike(f"%{search}%"),
                    Asset.asset_tag.ilike(f"%{search}%"),
                    Asset.serial_number.ilike(f"%{search}%")
                )
            )
        if category_id:
            stmt = stmt.where(Asset.category_id == category_id)
        if status:
            stmt = stmt.where(Asset.status == status)
        if department_id:
            # department_id filters current holder if type is department
            stmt = stmt.where(
                Asset.current_holder_type == "department",
                Asset.current_holder_id == department_id
            )
        if location:
            stmt = stmt.where(Asset.location.ilike(f"%{location}%"))
        if is_bookable is not None:
            stmt = stmt.where(Asset.is_bookable == is_bookable)
            
        stmt = stmt.order_by(Asset.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_filtered_assets(
        self,
        org_id: UUID,
        search: Optional[str] = None,
        category_id: Optional[UUID] = None,
        status: Optional[str] = None,
        department_id: Optional[UUID] = None,
        location: Optional[str] = None,
        is_bookable: Optional[bool] = None
    ) -> int:
        stmt = select(func.count()).select_from(Asset).where(Asset.org_id == org_id)
        
        if search:
            stmt = stmt.where(
                or_(
                    Asset.name.ilike(f"%{search}%"),
                    Asset.asset_tag.ilike(f"%{search}%"),
                    Asset.serial_number.ilike(f"%{search}%")
                )
            )
        if category_id:
            stmt = stmt.where(Asset.category_id == category_id)
        if status:
            stmt = stmt.where(Asset.status == status)
        if department_id:
            stmt = stmt.where(
                Asset.current_holder_type == "department",
                Asset.current_holder_id == department_id
            )
        if location:
            stmt = stmt.where(Asset.location.ilike(f"%{location}%"))
        if is_bookable is not None:
            stmt = stmt.where(Asset.is_bookable == is_bookable)
            
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def get_asset_history(self, asset_id: UUID, org_id: UUID) -> List[Dict[str, Any]]:
        from app.models.allocation import AssetAllocation
        from app.models.maintenance import MaintenanceRequest
        from app.models.user import User

        # Fetch allocations with user details
        alloc_stmt = select(AssetAllocation, User.name).join(
            User, AssetAllocation.allocated_by_id == User.id
        ).where(
            AssetAllocation.asset_id == asset_id,
            AssetAllocation.org_id == org_id
        ).order_by(AssetAllocation.allocated_at.desc())
        
        alloc_result = await self.db.execute(alloc_stmt)
        
        # Fetch maintenance requests with user details
        maint_stmt = select(MaintenanceRequest, User.name).join(
            User, MaintenanceRequest.raised_by_id == User.id
        ).where(
            MaintenanceRequest.asset_id == asset_id,
            MaintenanceRequest.org_id == org_id
        ).order_by(MaintenanceRequest.created_at.desc())
        
        maint_result = await self.db.execute(maint_stmt)
        
        history = []
        
        for alloc, actor_name in alloc_result.all():
            history.append({
                "event_type": "allocation",
                "id": alloc.id,
                "date": alloc.allocated_at,
                "actor_name": actor_name,
                "details": {
                    "allocated_to_type": alloc.allocated_to_type,
                    "allocated_to_id": alloc.allocated_to_id,
                    "status": alloc.status,
                    "returned_at": alloc.returned_at,
                    "notes": alloc.condition_check_in_notes
                }
            })
            
        for maint, actor_name in maint_result.all():
            history.append({
                "event_type": "maintenance",
                "id": maint.id,
                "date": maint.created_at,
                "actor_name": actor_name,
                "details": {
                    "issue_description": maint.issue_description,
                    "priority": maint.priority,
                    "status": maint.status,
                    "resolved_at": maint.resolved_at,
                    "technician_name": maint.technician_name
                }
            })
            
        # Sort history by date descending
        history.sort(key=lambda x: x["date"], reverse=True)
        return history
