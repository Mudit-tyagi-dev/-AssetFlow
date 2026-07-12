from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import MaintenancePriority, MaintenanceStatus

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    __table_args__ = (
        Index("idx_maintenance_asset", "asset_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    raised_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    issue_description: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[MaintenancePriority] = mapped_column(
        Enum(MaintenancePriority, name="maintenance_priority", native_enum=True),
        nullable=False,
        default=MaintenancePriority.medium
    )
    photo_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[MaintenanceStatus] = mapped_column(
        Enum(MaintenanceStatus, name="maintenance_status", native_enum=True),
        nullable=False,
        default=MaintenanceStatus.pending
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    technician_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    asset: Mapped[Asset] = relationship()
    raised_by: Mapped[User] = relationship(foreign_keys=[raised_by_id])
    approved_by: Mapped[Optional[User]] = relationship(foreign_keys=[approved_by_id])

from app.models.asset import Asset
from app.models.user import User
