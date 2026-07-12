from __future__ import annotations
from datetime import date, datetime
import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Date, Enum, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import HolderType, AllocationStatus, TransferStatus

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"
    __table_args__ = (
        Index("idx_allocations_asset", "asset_id", "status"),
        Index(
            "uq_allocations_one_active_per_asset",
            "asset_id",
            unique=True,
            postgresql_where=text("status = 'active'")
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    allocated_to_type: Mapped[HolderType] = mapped_column(
        Enum(HolderType, name="holder_type", native_enum=True),
        nullable=False
    )
    allocated_to_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    allocated_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )
    expected_return_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    returned_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    condition_check_in_notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[AllocationStatus] = mapped_column(
        Enum(AllocationStatus, name="allocation_status", native_enum=True),
        nullable=False,
        default=AllocationStatus.active
    )

    # Relationships
    asset: Mapped[Asset] = relationship(back_populates="allocations")
    allocated_by: Mapped[User] = relationship(foreign_keys=[allocated_by_id])


class TransferRequest(Base):
    __tablename__ = "transfer_requests"
    __table_args__ = (
        Index("idx_transfers_asset", "asset_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    requested_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    to_holder_type: Mapped[HolderType] = mapped_column(
        Enum(HolderType, name="holder_type", native_enum=True),
        nullable=False
    )
    to_holder_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    status: Mapped[TransferStatus] = mapped_column(
        Enum(TransferStatus, name="transfer_status", native_enum=True),
        nullable=False,
        default=TransferStatus.requested
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    asset: Mapped[Asset] = relationship()
    requested_by: Mapped[User] = relationship(foreign_keys=[requested_by_id])
    approved_by: Mapped[Optional[User]] = relationship(foreign_keys=[approved_by_id])

from app.models.asset import Asset
from app.models.user import User
