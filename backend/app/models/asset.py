from __future__ import annotations
from datetime import date, datetime
import uuid
from typing import Optional, List, Any
from sqlalchemy import String, ForeignKey, DateTime, Date, Numeric, Boolean, UniqueConstraint, Enum, Index, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import AssetCategoryStatus, AssetCondition, AssetStatus, HolderType

class AssetCategory(Base):
    __tablename__ = "asset_categories"
    __table_args__ = (
        UniqueConstraint("org_id", "name", name="asset_categories_org_id_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    custom_fields: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    status: Mapped[AssetCategoryStatus] = mapped_column(
        Enum(AssetCategoryStatus, name="asset_category_status", native_enum=True),
        nullable=False,
        default=AssetCategoryStatus.active
    )

    # Relationships
    assets: Mapped[List[Asset]] = relationship(back_populates="category")


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        UniqueConstraint("org_id", "asset_tag", name="assets_org_id_asset_tag_key"),
        Index("idx_assets_status", "org_id", "status"),
        Index(
            "uq_assets_org_serial",
            "org_id",
            "serial_number",
            unique=True,
            postgresql_where=text("serial_number IS NOT NULL")
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    asset_tag: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_categories.id"), nullable=False, index=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    acquisition_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    acquisition_cost: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    condition: Mapped[AssetCondition] = mapped_column(
        Enum(AssetCondition, name="asset_condition", native_enum=True),
        nullable=False,
        default=AssetCondition.good
    )
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_bookable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[AssetStatus] = mapped_column(
        Enum(AssetStatus, name="asset_status", native_enum=True),
        nullable=False,
        default=AssetStatus.available
    )
    photo_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    documents: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list)
    current_holder_type: Mapped[Optional[HolderType]] = mapped_column(
        Enum(HolderType, name="holder_type", native_enum=True),
        nullable=True
    )
    current_holder_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now
    )

    # Relationships
    category: Mapped[AssetCategory] = relationship(back_populates="assets")
    allocations: Mapped[List[AssetAllocation]] = relationship(back_populates="asset")

from app.models.allocation import AssetAllocation  # Avoid circular import at runtime
