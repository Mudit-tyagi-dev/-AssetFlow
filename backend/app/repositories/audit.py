from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.audit import AuditCycle, AuditItem

class AuditCycleRepository(BaseRepository[AuditCycle]):
    def __init__(self, db):
        super().__init__(AuditCycle, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[AuditCycle]:
        stmt = select(AuditCycle).options(
            selectinload(AuditCycle.auditors)
        ).where(AuditCycle.id == id, AuditCycle.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_audit_cycles_by_org(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[AuditCycle]:
        stmt = select(AuditCycle).options(
            selectinload(AuditCycle.auditors)
        ).where(AuditCycle.org_id == org_id)
        if status:
            stmt = stmt.where(AuditCycle.status == status)
        stmt = stmt.order_by(AuditCycle.date_range_start.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_audit_cycles_by_org(self, org_id: UUID, status: Optional[str] = None) -> int:
        stmt = select(func.count()).select_from(AuditCycle).where(AuditCycle.org_id == org_id)
        if status:
            stmt = stmt.where(AuditCycle.status == status)
        result = await self.db.execute(stmt)
        return result.scalar() or 0


class AuditItemRepository(BaseRepository[AuditItem]):
    def __init__(self, db):
        super().__init__(AuditItem, db)

    async def get_by_id_and_cycle(self, id: UUID, cycle_id: UUID) -> Optional[AuditItem]:
        stmt = select(AuditItem).where(AuditItem.id == id, AuditItem.audit_cycle_id == cycle_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_cycle_and_asset(self, cycle_id: UUID, asset_id: UUID) -> Optional[AuditItem]:
        stmt = select(AuditItem).where(
            AuditItem.audit_cycle_id == cycle_id,
            AuditItem.asset_id == asset_id
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_items_by_cycle(
        self,
        cycle_id: UUID,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[AuditItem]:
        stmt = select(AuditItem).where(AuditItem.audit_cycle_id == cycle_id)
        if status:
            stmt = stmt.where(AuditItem.status == status)
        stmt = stmt.order_by(AuditItem.id).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_items_by_cycle(self, cycle_id: UUID, status: Optional[str] = None) -> int:
        stmt = select(func.count()).select_from(AuditItem).where(AuditItem.audit_cycle_id == cycle_id)
        if status:
            stmt = stmt.where(AuditItem.status == status)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
