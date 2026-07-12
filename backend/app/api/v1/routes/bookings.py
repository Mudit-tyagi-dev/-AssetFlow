import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, get_pagination
from app.models.user import User
from app.schemas.booking import (
    ResourceBookingCreate,
    ResourceBookingUpdate,
    ResourceBookingRead,
)
from app.schemas.base import PaginatedResponse
from app.services.booking_service import BookingService
from app.repositories.booking import ResourceBookingRepository

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("", response_model=ResourceBookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: ResourceBookingCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Book a resource (is_bookable must be True). Enforces overlap checks."""
    async with db.begin():
        booking = await BookingService.create_booking(db, org_id, req, current_user.id)
        return booking

@router.get("", response_model=PaginatedResponse[ResourceBookingRead])
async def list_bookings(
    asset_id: Optional[uuid.UUID] = Query(None),
    booked_by_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None, description="Filter by upcoming, ongoing, completed, cancelled"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List bookings for the organization."""
    limit, offset = pagination
    booking_repo = ResourceBookingRepository(db)
    bookings = await booking_repo.get_bookings_by_org(org_id, asset_id, booked_by_id, status, offset, limit)
    total = await booking_repo.count_bookings_by_org(org_id, asset_id, booked_by_id, status)
    return PaginatedResponse(items=bookings, total=total, limit=limit, offset=offset)

@router.delete("/{id}", response_model=ResourceBookingRead)
async def cancel_booking(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an active or upcoming booking."""
    async with db.begin():
        booking = await BookingService.cancel_booking(db, org_id, id, current_user.id)
        return booking

@router.put("/{id}", response_model=ResourceBookingRead)
async def reschedule_booking(
    id: uuid.UUID,
    req: ResourceBookingUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reschedule an upcoming booking. Re-runs overlap validation."""
    async with db.begin():
        booking = await BookingService.reschedule_booking(db, org_id, id, req, current_user.id)
        return booking
