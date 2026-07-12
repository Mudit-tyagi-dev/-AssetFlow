from datetime import date, datetime
import uuid
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.models.enums import AssetCategoryStatus, AssetCondition, AssetStatus, HolderType

class AssetCategoryCreate(BaseModel):
    name: str = Field(..., max_length=255)
    custom_fields: Optional[Dict[str, Any]] = None

class AssetCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    custom_fields: Optional[Dict[str, Any]] = None
    status: Optional[AssetCategoryStatus] = None

class AssetCategoryRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    custom_fields: Optional[Dict[str, Any]]
    status: AssetCategoryStatus

    class Config:
        from_attributes = True


class AssetCreate(BaseModel):
    name: str = Field(..., max_length=255)
    category_id: uuid.UUID
    serial_number: Optional[str] = Field(None, max_length=255)
    acquisition_date: Optional[date] = None
    acquisition_cost: Optional[float] = None
    condition: Optional[AssetCondition] = AssetCondition.good
    location: Optional[str] = Field(None, max_length=255)
    is_bookable: Optional[bool] = False

class AssetUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    category_id: Optional[uuid.UUID] = None
    serial_number: Optional[str] = Field(None, max_length=255)
    acquisition_date: Optional[date] = None
    acquisition_cost: Optional[float] = None
    condition: Optional[AssetCondition] = None
    location: Optional[str] = Field(None, max_length=255)
    is_bookable: Optional[bool] = None
    status: Optional[AssetStatus] = None
    photo_url: Optional[str] = None
    documents: Optional[List[Dict[str, Any]]] = None

class AssetRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    asset_tag: str
    name: str
    category_id: uuid.UUID
    serial_number: Optional[str]
    acquisition_date: Optional[date]
    acquisition_cost: Optional[float]
    condition: AssetCondition
    location: Optional[str]
    is_bookable: bool
    status: AssetStatus
    photo_url: Optional[str]
    documents: List[Dict[str, Any]]
    current_holder_type: Optional[HolderType]
    current_holder_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetHistoryRead(BaseModel):
    event_type: str  # "allocation", "maintenance"
    id: uuid.UUID
    date: datetime
    actor_name: str
    details: Dict[str, Any]
