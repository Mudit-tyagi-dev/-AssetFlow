from __future__ import annotations
from datetime import date, datetime
import uuid
from typing import Optional, List
from sqlalchemy import ForeignKey, DateTime, Date, Enum, Index, CheckConstraint, UniqueConstraint, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import AuditCycleStatus, AuditItemStatus

audit_cycle_auditors = Table(
    "audit_cycle_auditors",
    Base.metadata,
    Column("audit_cycle_id", ForeignKey("audit_cycles.id", ondelete="CASCADE"), primary_key=True),
    Column("auditor_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

class AuditCycle(Base):
    __tablename__ = "audit_cycles"
    __table_args__ = (
        CheckConstraint("date_range_end >= date_range_start", name="audit_cycles_check_date_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    scope_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("departments.id"), nullable=True)
    scope_location: Mapped[Optional[str]] = mapped_column(nullable=True)
    date_range_start: Mapped[date] = mapped_column(Date, nullable=False)
    date_range_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[AuditCycleStatus] = mapped_column(
        Enum(AuditCycleStatus, name="audit_cycle_status", native_enum=True),
        nullable=False,
        default=AuditCycleStatus.draft
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    auditors: Mapped[List[User]] = relationship(secondary=audit_cycle_auditors)
    items: Mapped[List[AuditItem]] = relationship(back_populates="cycle", cascade="all, delete-orphan")
    scope_department: Mapped[Optional[Department]] = relationship()
    created_by: Mapped[User] = relationship()


class AuditItem(Base):
    __tablename__ = "audit_items"
    __table_args__ = (
        UniqueConstraint("audit_cycle_id", "asset_id", name="audit_items_audit_cycle_id_asset_id_key"),
        Index("idx_audit_items_cycle", "audit_cycle_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    audit_cycle_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("audit_cycles.id"), nullable=False)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    status: Mapped[AuditItemStatus] = mapped_column(
        Enum(AuditItemStatus, name="audit_item_status", native_enum=True),
        nullable=False,
        default=AuditItemStatus.pending
    )
    notes: Mapped[Optional[str]] = mapped_column(nullable=True)
    verified_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    cycle: Mapped[AuditCycle] = relationship(back_populates="items")
    asset: Mapped[Asset] = relationship()
    verified_by: Mapped[Optional[User]] = relationship()

from app.models.asset import Asset
from app.models.user import User
from app.models.org import Department
