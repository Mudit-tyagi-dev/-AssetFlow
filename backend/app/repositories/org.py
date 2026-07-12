from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.org import Organization, Department

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, db):
        super().__init__(Organization, db)

    async def get_by_slug(self, slug: str) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalars().first()


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self, db):
        super().__init__(Department, db)

    async def get_by_name(self, name: str, org_id: UUID) -> Optional[Department]:
        stmt = select(Department).where(Department.org_id == org_id, Department.name == name)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[Department]:
        stmt = select(Department).where(Department.id == id, Department.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_departments_by_parent(self, parent_id: UUID, org_id: UUID) -> List[Department]:
        stmt = select(Department).where(
            Department.org_id == org_id,
            Department.parent_department_id == parent_id
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_active_employees_or_assets(self, department_id: UUID, org_id: UUID) -> bool:
        # Check if department is in use by users or assets
        from app.models.user import User
        from app.models.asset import Asset
        
        user_stmt = select(func.count()).select_from(User).where(
            User.org_id == org_id,
            User.department_id == department_id,
            User.status == "active"
        )
        asset_stmt = select(func.count()).select_from(Asset).where(
            Asset.org_id == org_id,
            Asset.current_holder_type == "department",
            Asset.current_holder_id == department_id,
            Asset.status.in_(["allocated", "reserved"])
        )
        
        from sqlalchemy import func
        user_count = (await self.db.execute(user_stmt)).scalar() or 0
        asset_count = (await self.db.execute(asset_stmt)).scalar() or 0
        return (user_count + asset_count) > 0
