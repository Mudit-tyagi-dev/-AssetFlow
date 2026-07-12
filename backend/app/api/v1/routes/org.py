import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.api.v1.deps import get_current_org, get_current_user, require_role, get_pagination
from app.models.user import User
from app.models.org import Department
from app.models.asset import AssetCategory
from app.schemas import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentRead,
    AssetCategoryCreate,
    AssetCategoryUpdate,
    AssetCategoryRead,
    UserRead,
    UserAdminUpdate,
    PaginatedResponse,
)
from app.services.org_service import OrgService
from app.repositories.org import DepartmentRepository
from app.repositories.asset import AssetCategoryRepository
from app.repositories.user import UserRepository

router = APIRouter(prefix="/org", tags=["org"])

# --- Departments ---

@router.post("/departments", response_model=DepartmentRead, status_code=status.HTTP_201_CREATED)
async def create_department(
    req: DepartmentCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new Department (Admin only)."""
    async with db.begin():
        dept = await OrgService.create_department(db, org_id, req, current_user.id)
        return dept

@router.get("/departments", response_model=List[DepartmentRead])
async def list_departments(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all departments for the organization."""
    dept_repo = DepartmentRepository(db)
    # Get all (we don't paginated departments as they are usually small hierarchy trees)
    depts = await dept_repo.get_multi(org_id=org_id, limit=200)
    return depts

@router.put("/departments/{id}", response_model=DepartmentRead)
async def update_department(
    id: uuid.UUID,
    req: DepartmentUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Update a Department (Admin only). Includes parent change and department head assignment."""
    async with db.begin():
        dept = await OrgService.update_department(db, org_id, id, req, current_user.id)
        return dept

# --- Asset Categories ---

@router.post("/categories", response_model=AssetCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    req: AssetCategoryCreate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new Asset Category (Admin & Asset Manager only)."""
    async with db.begin():
        cat = await OrgService.create_category(db, org_id, req, current_user.id)
        return cat

@router.get("/categories", response_model=List[AssetCategoryRead])
async def list_categories(
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all asset categories for the organization."""
    cat_repo = AssetCategoryRepository(db)
    cats = await cat_repo.get_multi(org_id=org_id, limit=200)
    return cats

@router.put("/categories/{id}", response_model=AssetCategoryRead)
async def update_category(
    id: uuid.UUID,
    req: AssetCategoryUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Update an Asset Category (Admin & Asset Manager only)."""
    async with db.begin():
        cat = await OrgService.update_category(db, org_id, id, req, current_user.id)
        return cat

@router.delete("/categories/{id}", status_code=status.HTTP_200_OK)
async def delete_category(
    id: uuid.UUID,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin", "asset_manager")),
    db: AsyncSession = Depends(get_db)
):
    """Delete an Asset Category (Admin & Asset Manager only). Prevented if assets exist."""
    async with db.begin():
        await OrgService.delete_category(db, org_id, id, current_user.id)
        return {"message": "Category deleted successfully."}

# --- Employee Directory ---

@router.get("/employees", response_model=PaginatedResponse[UserRead])
async def list_employees(
    search: Optional[str] = Query(None, description="Search employee name or email"),
    pagination: tuple = Depends(get_pagination),
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List, search, and paginate employees within the organization."""
    limit, offset = pagination
    user_repo = UserRepository(db)
    employees = await user_repo.get_users_by_org(org_id, search, offset, limit)
    total = await user_repo.count_users_by_org(org_id, search)
    return PaginatedResponse(items=employees, total=total, limit=limit, offset=offset)

@router.put("/employees/{id}", response_model=UserRead)
async def promote_employee_role_or_status(
    id: uuid.UUID,
    req: UserAdminUpdate,
    org_id: uuid.UUID = Depends(get_current_org),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Promote an employee to department head or asset manager, or deactivate their account (Admin only)."""
    async with db.begin():
        user = await OrgService.update_employee_admin(db, org_id, id, req, current_user.id)
        return user
