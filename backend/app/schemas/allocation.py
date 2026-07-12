from datetime import date, datetime
import uuid
from typing import Optional
from pydantic import BaseModel
from app.models.enums import HolderType, AllocationStatus, TransferStatus

class AssetAllocationCreate(BaseModel):
    asset_id: uuid.UUID
    allocated_to_type: HolderType
    allocated_to_id: uuid.UUID
    expected_return_date: Optional[date] = None

class AssetAllocationReturn(BaseModel):
    condition_check_in_notes: Optional[str] = None

class AssetAllocationRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    asset_id: uuid.UUID
    allocated_to_type: HolderType
    allocated_to_id: uuid.UUID
    allocated_by_id: uuid.UUID
    allocated_at: datetime
    expected_return_date: Optional[date]
    returned_at: Optional[datetime]
    condition_check_in_notes: Optional[str]
    status: AllocationStatus

    class Config:
        from_attributes = True


class TransferRequestCreate(BaseModel):
    asset_id: uuid.UUID
    to_holder_type: HolderType
    to_holder_id: uuid.UUID

class TransferRequestUpdate(BaseModel):
    status: TransferStatus  # "approved" or "rejected"

class TransferRequestRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    asset_id: uuid.UUID
    requested_by_id: uuid.UUID
    to_holder_type: HolderType
    to_holder_id: uuid.UUID
    status: TransferStatus
    approved_by_id: Optional[uuid.UUID]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
