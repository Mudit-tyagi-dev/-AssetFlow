from datetime import datetime
import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ActivityLogRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    actor_id: uuid.UUID
    action: str
    entity_type: str
    entity_id: uuid.UUID
    metadata: Optional[Dict[str, Any]] = Field(validation_alias="meta_data")
    created_at: datetime

    class Config:
        from_attributes = True
