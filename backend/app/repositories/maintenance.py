from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from app.repositories.base import BaseRepository
from app.models.maintenance import MaintenanceRequest

class MaintenanceRequestRepository(BaseRepository[MaintenanceRequest]):
    def __init__(self, db):
        super().__init__(MaintenanceRequest, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[MaintenanceRequest]:
        stmt = select(MaintenanceRequest).where(
            MaintenanceRequest.id == id,
            MaintenanceRequest.org_id == org_id
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_active_by_asset(self, asset_id: UUID, org_id: UUID) -> Optional[MaintenanceRequest]:
        # Returns requests not resolved or rejected
        stmt = select(MaintenanceRequest).where(
            MaintenanceRequest.asset_id == asset_id,
            MaintenanceRequest.org_id == org_id,
            MaintenanceRequest.status.notin_(["resolved", "rejected"])
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_maintenance_by_org(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        asset_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[MaintenanceRequest]:
        stmt = select(MaintenanceRequest).where(MaintenanceRequest.org_id == org_id)
        if status:
            stmt = stmt.where(MaintenanceRequest.status == status)
        if priority:
            stmt = stmt.where(MaintenanceRequest.priority == priority)
        if asset_id:
            stmt = stmt.where(MaintenanceRequest.asset_id == asset_id)
        stmt = stmt.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_maintenance_by_org(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        asset_id: Optional[UUID] = None
    ) -> int:
        stmt = select(func.count()).select_from(MaintenanceRequest).where(MaintenanceRequest.org_id == org_id)
        if status:
            stmt = stmt.where(MaintenanceRequest.status == status)
        if priority:
            stmt = stmt.where(MaintenanceRequest.priority == priority)
        if asset_id:
            stmt = stmt.where(MaintenanceRequest.asset_id == asset_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
