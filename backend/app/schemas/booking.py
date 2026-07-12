from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from app.models.enums import BookingStatus

class ResourceBookingCreate(BaseModel):
    asset_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    department_id: Optional[uuid.UUID] = None

    @model_validator(mode="after")
    def check_times(self) -> "ResourceBookingCreate":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be greater than start_time")
        return self

class ResourceBookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None

    @model_validator(mode="after")
    def check_times(self) -> "ResourceBookingUpdate":
        if self.start_time is not None and self.end_time is not None:
            if self.end_time <= self.start_time:
                raise ValueError("end_time must be greater than start_time")
        return self

class ResourceBookingRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    asset_id: uuid.UUID
    booked_by_id: uuid.UUID
    department_id: Optional[uuid.UUID]
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True
