from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional, List
from sqlalchemy import String, ForeignKey, DateTime, UniqueConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.uuid import uuid7

from app.models.base import Base
from app.models.enums import OrgStatus, DepartmentStatus

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    status: Mapped[OrgStatus] = mapped_column(
        Enum(OrgStatus, name="org_status", native_enum=True),
        nullable=False,
        default=OrgStatus.active
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )

    # Relationships
    departments: Mapped[List[Department]] = relationship(
        back_populates="organization",
        foreign_keys="[Department.org_id]"
    )
    users: Mapped[List[User]] = relationship(
        back_populates="organization",
        foreign_keys="[User.org_id]"
    )


class Department(Base):
    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("org_id", "name", name="departments_org_id_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True
    )
    department_head_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", use_alter=True, name="fk_departments_head"),
        nullable=True,
        index=True
    )
    status: Mapped[DepartmentStatus] = mapped_column(
        Enum(DepartmentStatus, name="department_status", native_enum=True),
        nullable=False,
        default=DepartmentStatus.active
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now
    )

    # Relationships
    organization: Mapped[Organization] = relationship(back_populates="departments", foreign_keys=[org_id])
    parent: Mapped[Optional[Department]] = relationship(
        remote_side=[id],
        back_populates="children",
        foreign_keys=[parent_department_id]
    )
    children: Mapped[List[Department]] = relationship(
        back_populates="parent",
        foreign_keys=[parent_department_id]
    )
    head: Mapped[Optional[User]] = relationship(
        foreign_keys=[department_head_id],
        post_update=True
    )

from app.models.user import User  # Avoid circular import at runtime
