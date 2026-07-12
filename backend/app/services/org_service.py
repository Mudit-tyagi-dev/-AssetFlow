import uuid
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError, DependencyInUseError
from app.models.org import Department
from app.models.asset import Asset, AssetCategory
from app.models.user import User
from app.models.allocation import AssetAllocation
from app.repositories.org import DepartmentRepository, OrganizationRepository
from app.repositories.asset import AssetCategoryRepository
from app.repositories.user import UserRepository
from app.schemas import DepartmentCreate, DepartmentUpdate, AssetCategoryCreate, AssetCategoryUpdate, UserAdminUpdate
from app.services.utils import log_activity, create_notification

class OrgService:
    # --- Department Methods ---
    @staticmethod
    async def create_department(db: AsyncSession, org_id: uuid.UUID, req: DepartmentCreate, actor_id: uuid.UUID) -> Department:
        dept_repo = DepartmentRepository(db)
        
        # Check name uniqueness in org
        existing = await dept_repo.get_by_name(req.name, org_id)
        if existing:
            raise ConflictError(f"Department '{req.name}' already exists in this organization.")

        # Check parent exists in org
        if req.parent_department_id:
            parent = await dept_repo.get_by_id_and_org(req.parent_department_id, org_id)
            if not parent:
                raise NotFoundError("Parent department not found.")

        dept = Department(
            id=uuid7(),
            org_id=org_id,
            name=req.name,
            parent_department_id=req.parent_department_id,
            status="active"
        )
        db.add(dept)
        await db.flush()

        await log_activity(
            db, org_id, actor_id, "create_department", "department", dept.id, {"name": req.name}
        )
        return dept

    @staticmethod
    async def update_department(
        db: AsyncSession, org_id: uuid.UUID, dept_id: uuid.UUID, req: DepartmentUpdate, actor_id: uuid.UUID
    ) -> Department:
        dept_repo = DepartmentRepository(db)
        dept = await dept_repo.get_by_id_and_org(dept_id, org_id)
        if not dept:
            raise NotFoundError("Department not found.")

        # If renaming, check name uniqueness
        if req.name and req.name != dept.name:
            existing = await dept_repo.get_by_name(req.name, org_id)
            if existing:
                raise ConflictError(f"Department '{req.name}' already exists in this organization.")

        # If changing parent, check parent exists
        if req.parent_department_id and req.parent_department_id != dept.parent_department_id:
            if req.parent_department_id == dept.id:
                raise ConflictError("A department cannot be its own parent.")
            parent = await dept_repo.get_by_id_and_org(req.parent_department_id, org_id)
            if not parent:
                raise NotFoundError("Parent department not found.")

        # If deactivating, check active head, employees, or allocations
        if req.status == "inactive" and dept.status == "active":
            # 1. Active department head check
            if dept.department_head_id:
                raise DependencyInUseError("Cannot deactivate department with an active department head assigned.")

            # 2. Check active employees in department
            user_stmt = select(func.count()).select_from(User).where(
                User.org_id == org_id,
                User.department_id == dept.id,
                User.status == "active"
            )
            user_count = (await db.execute(user_stmt)).scalar() or 0
            if user_count > 0:
                raise DependencyInUseError(f"Cannot deactivate department with {user_count} active employees assigned.")

            # 3. Check active allocations to department
            alloc_stmt = select(func.count()).select_from(AssetAllocation).where(
                AssetAllocation.org_id == org_id,
                AssetAllocation.allocated_to_type == "department",
                AssetAllocation.allocated_to_id == dept.id,
                AssetAllocation.status == "active"
            )
            alloc_count = (await db.execute(alloc_stmt)).scalar() or 0
            if alloc_count > 0:
                raise DependencyInUseError(f"Cannot deactivate department with {alloc_count} active asset allocations.")

        # Perform update
        update_dict = req.model_dump(exclude_unset=True)
        # Handle head assignment: if changing head, check if user exists and is active
        if "department_head_id" in update_dict and update_dict["department_head_id"] is not None:
            user_repo = UserRepository(db)
            head_user = await user_repo.get_by_id_and_org(update_dict["department_head_id"], org_id)
            if not head_user:
                raise NotFoundError("Department head user not found.")
            if head_user.status != "active":
                raise ConflictError("Department head user must be active.")

        for field, value in update_dict.items():
            setattr(dept, field, value)

        await db.flush()
        await log_activity(db, org_id, actor_id, "update_department", "department", dept.id, update_dict)
        return dept

    # --- Asset Category Methods ---
    @staticmethod
    async def create_category(db: AsyncSession, org_id: uuid.UUID, req: AssetCategoryCreate, actor_id: uuid.UUID) -> AssetCategory:
        cat_repo = AssetCategoryRepository(db)
        
        existing = await cat_repo.get_by_name(req.name, org_id)
        if existing:
            raise ConflictError(f"Asset category '{req.name}' already exists in this organization.")

        cat = AssetCategory(
            id=uuid7(),
            org_id=org_id,
            name=req.name,
            custom_fields=req.custom_fields,
            status="active"
        )
        db.add(cat)
        await db.flush()

        await log_activity(db, org_id, actor_id, "create_category", "asset_category", cat.id, {"name": req.name})
        return cat

    @staticmethod
    async def update_category(
        db: AsyncSession, org_id: uuid.UUID, cat_id: uuid.UUID, req: AssetCategoryUpdate, actor_id: uuid.UUID
    ) -> AssetCategory:
        cat_repo = AssetCategoryRepository(db)
        cat = await cat_repo.get_by_id_and_org(cat_id, org_id)
        if not cat:
            raise NotFoundError("Asset category not found.")

        if req.name and req.name != cat.name:
            existing = await cat_repo.get_by_name(req.name, org_id)
            if existing:
                raise ConflictError(f"Asset category '{req.name}' already exists in this organization.")

        # If deactivating, check if category has active assets
        if req.status == "inactive" and cat.status == "active":
            asset_count = await cat_repo.count_assets_in_category(cat.id, org_id)
            if asset_count > 0:
                raise DependencyInUseError(f"Cannot deactivate category with {asset_count} assets tied to it.")

        update_dict = req.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(cat, field, value)

        await db.flush()
        await log_activity(db, org_id, actor_id, "update_category", "asset_category", cat.id, update_dict)
        return cat

    @staticmethod
    async def delete_category(db: AsyncSession, org_id: uuid.UUID, cat_id: uuid.UUID, actor_id: uuid.UUID) -> None:
        cat_repo = AssetCategoryRepository(db)
        cat = await cat_repo.get_by_id_and_org(cat_id, org_id)
        if not cat:
            raise NotFoundError("Asset category not found.")

        # Check if category has active assets
        asset_count = await cat_repo.count_assets_in_category(cat.id, org_id)
        if asset_count > 0:
            raise DependencyInUseError(f"Cannot delete category with {asset_count} assets tied to it.")

        await cat_repo.remove(cat.id)
        await log_activity(db, org_id, actor_id, "delete_category", "asset_category", cat.id, {"name": cat.name})

    # --- Employee Directory Methods ---
    @staticmethod
    async def update_employee_admin(
        db: AsyncSession, org_id: uuid.UUID, target_user_id: uuid.UUID, req: UserAdminUpdate, actor_id: uuid.UUID
    ) -> User:
        user_repo = UserRepository(db)
        user = await user_repo.get_by_id_and_org(target_user_id, org_id)
        if not user:
            raise NotFoundError("User not found.")

        if user.id == actor_id:
            raise ConflictError("Admins cannot modify their own role or status.")

        update_dict = req.model_dump(exclude_unset=True)
        
        # Check department validity if updated
        if "department_id" in update_dict and update_dict["department_id"] is not None:
            dept_repo = DepartmentRepository(db)
            dept = await dept_repo.get_by_id_and_org(update_dict["department_id"], org_id)
            if not dept:
                raise NotFoundError("Department not found.")
            if dept.status != "active":
                raise ConflictError("Department must be active.")

        for field, value in update_dict.items():
            setattr(user, field, value)

        await db.flush()
        
        # Notify employee of administrative update
        await create_notification(
            db,
            org_id=org_id,
            user_id=target_user_id,
            type_="profile_update",
            message=f"Your profile has been updated by an administrator. Status: {user.status.value}, Role: {user.role.value}.",
            related_type="user",
            related_id=user.id
        )

        await log_activity(db, org_id, actor_id, "admin_update_user", "user", user.id, update_dict)
        return user
