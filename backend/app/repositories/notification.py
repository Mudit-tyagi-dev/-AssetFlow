from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from app.repositories.base import BaseRepository
from app.models.notification import Notification

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db):
        super().__init__(Notification, db)

    async def get_by_id_and_user(self, id: UUID, user_id: UUID) -> Optional[Notification]:
        stmt = select(Notification).where(Notification.id == id, Notification.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_notifications_by_user(
        self,
        user_id: UUID,
        is_read: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)
        stmt = stmt.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_notifications_by_user(self, user_id: UUID, is_read: Optional[bool] = None) -> int:
        stmt = select(func.count()).select_from(Notification).where(Notification.user_id == user_id)
        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
