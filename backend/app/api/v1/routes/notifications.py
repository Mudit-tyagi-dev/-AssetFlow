import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_user, get_pagination
from app.models.user import User
from app.schemas.notification import NotificationRead, NotificationUpdate
from app.schemas.base import PaginatedResponse
from app.repositories.notification import NotificationRepository
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=PaginatedResponse[NotificationRead])
async def list_notifications(
    is_read: Optional[bool] = Query(None),
    pagination: tuple = Depends(get_pagination),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve notifications for the current authenticated user."""
    limit, offset = pagination
    notif_repo = NotificationRepository(db)
    notifications = await notif_repo.get_notifications_by_user(current_user.id, is_read, offset, limit)
    total = await notif_repo.count_notifications_by_user(current_user.id, is_read)
    return PaginatedResponse(items=notifications, total=total, limit=limit, offset=offset)

@router.put("/{id}", response_model=NotificationRead)
async def update_notification(
    id: uuid.UUID,
    req: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a notification as read or unread."""
    async with db.begin():
        notif_repo = NotificationRepository(db)
        notif = await notif_repo.get_by_id_and_user(id, current_user.id)
        if not notif:
            raise NotFoundError("Notification not found.")
        
        notif.is_read = req.is_read
        await db.flush()
        return notif
