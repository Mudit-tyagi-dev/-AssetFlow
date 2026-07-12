from datetime import date, datetime
import uuid
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator
from app.models.enums import AuditCycleStatus, AuditItemStatus
from app.schemas.user import UserRead

class AuditCycleCreate(BaseModel):
    scope_department_id: Optional[uuid.UUID] = None
    scope_location: Optional[str] = Field(None, max_length=255)
    date_range_start: date
    date_range_end: date
    auditor_ids: List[uuid.UUID] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_dates(self) -> "AuditCycleCreate":
        if self.date_range_end < self.date_range_start:
            raise ValueError("date_range_end must be greater than or equal to date_range_start")
        return self

class AuditItemUpdate(BaseModel):
    status: AuditItemStatus  # "verified", "missing", "damaged"
    notes: Optional[str] = None

class AuditItemRead(BaseModel):
    id: uuid.UUID
    audit_cycle_id: uuid.UUID
    asset_id: uuid.UUID
    status: AuditItemStatus
    notes: Optional[str]
    verified_by_id: Optional[uuid.UUID]
    verified_at: Optional[datetime]

    class Config:
        from_attributes = True

class AuditCycleRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    scope_department_id: Optional[uuid.UUID]
    scope_location: Optional[str]
    date_range_start: date
    date_range_end: date
    status: AuditCycleStatus
    created_by_id: uuid.UUID
    closed_at: Optional[datetime]
    auditors: List[UserRead] = []

    class Config:
        from_attributes = True
