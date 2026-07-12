from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from app.repositories.base import BaseRepository
from app.models.booking import ResourceBooking

class ResourceBookingRepository(BaseRepository[ResourceBooking]):
    def __init__(self, db):
        super().__init__(ResourceBooking, db)

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[ResourceBooking]:
        stmt = select(ResourceBooking).where(ResourceBooking.id == id, ResourceBooking.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_overlapping_bookings(
        self,
        asset_id: UUID,
        start_time: datetime,
        end_time: datetime,
        org_id: UUID,
        exclude_booking_id: Optional[UUID] = None
    ) -> List[ResourceBooking]:
        stmt = select(ResourceBooking).where(
            ResourceBooking.asset_id == asset_id,
            ResourceBooking.org_id == org_id,
            ResourceBooking.status.in_(["upcoming", "ongoing"]),
            ResourceBooking.start_time < end_time,
            ResourceBooking.end_time > start_time
        )
        if exclude_booking_id:
            stmt = stmt.where(ResourceBooking.id != exclude_booking_id)
            
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_bookings_by_org(
        self,
        org_id: UUID,
        asset_id: Optional[UUID] = None,
        booked_by_id: Optional[UUID] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[ResourceBooking]:
        stmt = select(ResourceBooking).where(ResourceBooking.org_id == org_id)
        if asset_id:
            stmt = stmt.where(ResourceBooking.asset_id == asset_id)
        if booked_by_id:
            stmt = stmt.where(ResourceBooking.booked_by_id == booked_by_id)
        if status:
            stmt = stmt.where(ResourceBooking.status == status)
        stmt = stmt.order_by(ResourceBooking.start_time.asc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_bookings_by_org(
        self,
        org_id: UUID,
        asset_id: Optional[UUID] = None,
        booked_by_id: Optional[UUID] = None,
        status: Optional[str] = None
    ) -> int:
        stmt = select(func.count()).select_from(ResourceBooking).where(ResourceBooking.org_id == org_id)
        if asset_id:
            stmt = stmt.where(ResourceBooking.asset_id == asset_id)
        if booked_by_id:
            stmt = stmt.where(ResourceBooking.booked_by_id == booked_by_id)
        if status:
            stmt = stmt.where(ResourceBooking.status == status)
        result = await self.db.execute(stmt)
        return result.scalar() or 0
