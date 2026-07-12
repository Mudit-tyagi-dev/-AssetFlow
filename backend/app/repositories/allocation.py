from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.allocation import AssetAllocation, TransferRequest

class AssetAllocationRepository(BaseRepository[AssetAllocation]):
    def __init__(self, db):
        super().__init__(AssetAllocation, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[AssetAllocation]:
        stmt = select(AssetAllocation).where(AssetAllocation.id == id, AssetAllocation.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_active_by_asset(self, asset_id: UUID, org_id: UUID, lock: bool = False) -> Optional[AssetAllocation]:
        stmt = select(AssetAllocation).where(
            AssetAllocation.asset_id == asset_id,
            AssetAllocation.org_id == org_id,
            AssetAllocation.status == "active"
        )
        if lock:
            stmt = stmt.with_for_update()
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_allocations_by_org(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[AssetAllocation]:
        stmt = select(AssetAllocation).where(AssetAllocation.org_id == org_id)
        if status:
            stmt = stmt.where(AssetAllocation.status == status)
        stmt = stmt.order_by(AssetAllocation.allocated_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_allocations_by_org(self, org_id: UUID, status: Optional[str] = None) -> int:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(AssetAllocation).where(AssetAllocation.org_id == org_id)
        if status:
            stmt = stmt.where(AssetAllocation.status == status)
        result = await self.db.execute(stmt)
        return result.scalar() or 0


class TransferRequestRepository(BaseRepository[TransferRequest]):
    def __init__(self, db):
        super().__init__(TransferRequest, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[TransferRequest]:
        stmt = select(TransferRequest).where(TransferRequest.id == id, TransferRequest.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_active_by_asset(self, asset_id: UUID, org_id: UUID) -> Optional[TransferRequest]:
        stmt = select(TransferRequest).where(
            TransferRequest.asset_id == asset_id,
            TransferRequest.org_id == org_id,
            TransferRequest.status == "requested"
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_transfers_by_org(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[TransferRequest]:
        stmt = select(TransferRequest).where(TransferRequest.org_id == org_id)
        if status:
            stmt = stmt.where(TransferRequest.status == status)
        stmt = stmt.order_by(TransferRequest.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_transfers_by_org(self, org_id: UUID, status: Optional[str] = None) -> int:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(TransferRequest).where(TransferRequest.org_id == org_id)
        if status:
            stmt = stmt.where(TransferRequest.status == status)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
