from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func
from app.repositories.base import BaseRepository
from app.models.activity import ActivityLog

class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db):
        super().__init__(ActivityLog, db)

    async def get_logs_by_org(
        self,
        org_id: UUID,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[ActivityLog]:
        stmt = select(ActivityLog).where(ActivityLog.org_id == org_id)
        if entity_type:
            stmt = stmt.where(ActivityLog.entity_type == entity_type)
        if entity_id:
            stmt = stmt.where(ActivityLog.entity_id == entity_id)
        stmt = stmt.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_logs_by_org(
        self,
        org_id: UUID,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None
    ) -> int:
        stmt = select(func.count()).select_from(ActivityLog).where(ActivityLog.org_id == org_id)
        if entity_type:
            stmt = stmt.where(ActivityLog.entity_type == entity_type)
        if entity_id:
            stmt = stmt.where(ActivityLog.entity_id == entity_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
