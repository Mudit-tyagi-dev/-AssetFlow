import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError, BookingOverlapError
from app.models.booking import ResourceBooking
from app.models.enums import BookingStatus, AssetStatus
from app.repositories.asset import AssetRepository
from app.repositories.booking import ResourceBookingRepository
from app.schemas.booking import ResourceBookingCreate, ResourceBookingUpdate
from app.services.utils import log_activity, create_notification

class BookingService:
    @staticmethod
    async def create_booking(
        db: AsyncSession, org_id: uuid.UUID, req: ResourceBookingCreate, actor_id: uuid.UUID
    ) -> ResourceBooking:
        asset_repo = AssetRepository(db)
        booking_repo = ResourceBookingRepository(db)

        # 1. Validate asset
        asset = await asset_repo.get_by_id_and_org(req.asset_id, org_id)
        if not asset:
            raise NotFoundError("Asset not found.")
        if not asset.is_bookable:
            raise ConflictError("This asset is not marked as bookable.")
        if asset.status in (AssetStatus.retired, AssetStatus.disposed):
            raise ConflictError("Cannot book a retired or disposed asset.")

        # 2. Check for overlaps
        overlaps = await booking_repo.get_overlapping_bookings(
            asset_id=req.asset_id,
            start_time=req.start_time,
            end_time=req.end_time,
            org_id=org_id
        )
        if overlaps:
            conflicting = overlaps[0]
            raise BookingOverlapError(
                message=f"This asset is already booked from {conflicting.start_time.strftime('%Y-%m-%d %H:%M')} to {conflicting.end_time.strftime('%Y-%m-%d %H:%M')}.",
                details={
                    "conflicting_booking_id": str(conflicting.id),
                    "start_time": conflicting.start_time.isoformat(),
                    "end_time": conflicting.end_time.isoformat()
                }
            )

        # 3. Create booking
        booking = ResourceBooking(
            id=uuid7(),
            org_id=org_id,
            asset_id=req.asset_id,
            booked_by_id=actor_id,
            department_id=req.department_id,
            start_time=req.start_time,
            end_time=req.end_time,
            status=BookingStatus.upcoming,
            created_at=datetime.now(timezone.utc)
        )
        db.add(booking)
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="create_booking",
            entity_type="booking",
            entity_id=booking.id,
            metadata={"start_time": req.start_time.isoformat(), "end_time": req.end_time.isoformat()}
        )

        return booking

    @staticmethod
    async def cancel_booking(
        db: AsyncSession, org_id: uuid.UUID, booking_id: uuid.UUID, actor_id: uuid.UUID
    ) -> ResourceBooking:
        booking_repo = ResourceBookingRepository(db)
        booking = await booking_repo.get_by_id_and_org(booking_id, org_id)
        if not booking:
            raise NotFoundError("Booking not found.")

        # Only cancel upcoming or ongoing
        if booking.status not in (BookingStatus.upcoming, BookingStatus.ongoing):
            raise ConflictError(f"Cannot cancel a booking in '{booking.status.value}' status.")

        booking.status = BookingStatus.cancelled
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="cancel_booking",
            entity_type="booking",
            entity_id=booking.id
        )

        return booking

    @staticmethod
    async def reschedule_booking(
        db: AsyncSession, org_id: uuid.UUID, booking_id: uuid.UUID, req: ResourceBookingUpdate, actor_id: uuid.UUID
    ) -> ResourceBooking:
        booking_repo = ResourceBookingRepository(db)
        booking = await booking_repo.get_by_id_and_org(booking_id, org_id)
        if not booking:
            raise NotFoundError("Booking not found.")

        if booking.status != BookingStatus.upcoming:
            raise ConflictError("Only upcoming bookings can be rescheduled.")

        # Get values (or fall back to current ones if not updated)
        new_start = req.start_time if req.start_time is not None else booking.start_time
        new_end = req.end_time if req.end_time is not None else booking.end_time

        # Check overlaps excluding this booking
        overlaps = await booking_repo.get_overlapping_bookings(
            asset_id=booking.asset_id,
            start_time=new_start,
            end_time=new_end,
            org_id=org_id,
            exclude_booking_id=booking.id
        )
        if overlaps:
            conflicting = overlaps[0]
            raise BookingOverlapError(
                message=f"This asset is already booked from {conflicting.start_time.strftime('%Y-%m-%d %H:%M')} to {conflicting.end_time.strftime('%Y-%m-%d %H:%M')}.",
                details={
                    "conflicting_booking_id": str(conflicting.id),
                    "start_time": conflicting.start_time.isoformat(),
                    "end_time": conflicting.end_time.isoformat()
                }
            )

        booking.start_time = new_start
        booking.end_time = new_end
        if req.status is not None:
            booking.status = req.status
            
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="reschedule_booking",
            entity_type="booking",
            entity_id=booking.id,
            metadata={"start_time": new_start.isoformat(), "end_time": new_end.isoformat()}
        )

        return booking
