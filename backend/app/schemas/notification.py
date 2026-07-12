from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel

class NotificationRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    user_id: uuid.UUID
    type: str
    message: str
    related_entity_type: Optional[str]
    related_entity_id: Optional[uuid.UUID]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool
