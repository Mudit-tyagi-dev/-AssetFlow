from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import MaintenancePriority, MaintenanceStatus

class MaintenanceRequestCreate(BaseModel):
    asset_id: uuid.UUID
    issue_description: str = Field(..., min_length=5)
    priority: Optional[MaintenancePriority] = MaintenancePriority.medium
    photo_url: Optional[str] = None

class MaintenanceRequestUpdate(BaseModel):
    status: Optional[MaintenanceStatus] = None
    technician_name: Optional[str] = Field(None, max_length=255)

class MaintenanceRequestRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    asset_id: uuid.UUID
    raised_by_id: uuid.UUID
    issue_description: str
    priority: MaintenancePriority
    photo_url: Optional[str]
    status: MaintenanceStatus
    approved_by_id: Optional[uuid.UUID]
    technician_name: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
