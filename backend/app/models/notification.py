from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_user_unread", "user_id", "is_read"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(nullable=False)
    related_entity_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )

    # Relationships
    user: Mapped[User] = relationship()

from app.models.user import User
