import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7
from app.models.activity import ActivityLog
from app.models.notification import Notification

async def log_activity(
    db: AsyncSession,
    org_id: uuid.UUID,
    actor_id: uuid.UUID,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    log_entry = ActivityLog(
        id=uuid7(),
        org_id=org_id,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        meta_data=metadata
    )
    
    # Use a savepoint to prevent failing the entire transaction if the log fails
    # (e.g. if the actor_id doesn't exist in the remote DB)
    async with db.begin_nested():
        db.add(log_entry)
        try:
            await db.flush()
        except Exception as e:
            # The begin_nested() context manager will automatically rollback to the savepoint
            import logging
            logging.error(f"Failed to save activity log: {e}")

async def create_notification(
    db: AsyncSession,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
    type_: str,
    message: str,
    related_type: Optional[str] = None,
    related_id: Optional[uuid.UUID] = None
) -> None:
    notif = Notification(
        id=uuid7(),
        org_id=org_id,
        user_id=user_id,
        type=type_,
        message=message,
        related_entity_type=related_type,
        related_entity_id=related_id,
        is_read=False
    )
    db.add(notif)
