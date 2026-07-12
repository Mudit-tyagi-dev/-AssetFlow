from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import OrgStatus, DepartmentStatus

class OrganizationCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)

class OrganizationRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    status: OrgStatus
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str = Field(..., max_length=255)
    parent_department_id: Optional[uuid.UUID] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    parent_department_id: Optional[uuid.UUID] = None
    department_head_id: Optional[uuid.UUID] = None
    status: Optional[DepartmentStatus] = None

class DepartmentRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    parent_department_id: Optional[uuid.UUID]
    department_head_id: Optional[uuid.UUID]
    status: DepartmentStatus
    created_at: datetime

    class Config:
        from_attributes = True
