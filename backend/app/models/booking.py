from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, DateTime, Enum, Index, CheckConstraint, func, text
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import BookingStatus

class ResourceBooking(Base):
    __tablename__ = "resource_bookings"
    __table_args__ = (
        CheckConstraint("end_time > start_time", name="resource_bookings_check_end_time_after_start_time"),
        ExcludeConstraint(
            ("asset_id", "="),
            (func.tstzrange(text("start_time"), text("end_time"), "[)"), "&&"),
            using="gist",
            where=text("status IN ('upcoming', 'ongoing')"),
            name="resource_bookings_asset_time_exclude"
        ),
        Index("idx_bookings_asset_time", "asset_id", "start_time"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    booked_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("departments.id"), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status", native_enum=True),
        nullable=False,
        default=BookingStatus.upcoming
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )

    # Relationships
    asset: Mapped[Asset] = relationship()
    booked_by: Mapped[User] = relationship()
    department: Mapped[Optional[Department]] = relationship()

from app.models.asset import Asset
from app.models.user import User
from app.models.org import Department
