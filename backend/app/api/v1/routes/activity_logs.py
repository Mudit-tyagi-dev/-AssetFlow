import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, require_role, get_pagination
from app.models.user import User
from app.schemas.activity import ActivityLogRead
from app.schemas.base import PaginatedResponse
from app.repositories.activity import ActivityLogRepository

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("", response_model=PaginatedResponse[ActivityLogRead])
async def list_activity_logs(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[uuid.UUID] = Query(None),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve historical audit logs (Admin only)."""
    limit, offset = pagination
    log_repo = ActivityLogRepository(db)
    logs = await log_repo.get_logs_by_org(org_id, entity_type, entity_id, offset, limit)
    total = await log_repo.count_logs_by_org(org_id, entity_type, entity_id)
    return PaginatedResponse(items=logs, total=total, limit=limit, offset=offset)
