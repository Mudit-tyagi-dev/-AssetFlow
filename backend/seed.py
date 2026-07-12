import asyncio
from datetime import datetime, date, timedelta, timezone
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.uuid import uuid7

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Base
from app.models.org import Organization, Department
from app.models.user import User
from app.models.asset import AssetCategory, Asset
from app.models.allocation import AssetAllocation
from app.models.booking import ResourceBooking
from app.models.maintenance import MaintenanceRequest
from app.models.enums import (
    OrgStatus,
    UserRole,
    UserStatus,
    DepartmentStatus,
    AssetCategoryStatus,
    AssetCondition,
    AssetStatus,
    HolderType,
    AllocationStatus,
    BookingStatus,
    MaintenancePriority,
    MaintenanceStatus,
)

async def seed_data():
    print(f"Connecting to database: {settings.DATABASE_URL} ...")
    
    if settings.DATABASE_URL.startswith("sqlite"):
        from sqlalchemy.dialects.postgresql import ExcludeConstraint, JSONB
        from sqlalchemy import JSON
        for table in Base.metadata.tables.values():
            exclude_constraints = [c for c in table.constraints if isinstance(c, ExcludeConstraint)]
            for c in exclude_constraints:
                table.constraints.remove(c)
            for column in table.columns:
                if isinstance(column.type, JSONB):
                    column.type = JSON()
            for index in list(table.indexes):
                if hasattr(index, "dialect_options") and "postgresql" in index.dialect_options:
                    try:
                        del index.dialect_options["postgresql"]
                    except Exception:
                        pass

    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    if settings.DATABASE_URL.startswith("sqlite"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        async with session.begin():
            print("Creating tables if they don't exist...")
            # For Postgres, create the extensions first if they don't exist
            try:
                await session.execute(sa.text("CREATE EXTENSION IF NOT EXISTS btree_gist"))
            except Exception:
                # If running SQLite or lack permissions, skip
                pass
            
            # Seed demo organization
            print("Seeding Organization...")
            org = Organization(
                id=uuid7(),
                name="Acme Corporation",
                slug="acme",
                status=OrgStatus.active
            )
            session.add(org)
            await session.flush()

            # Seed departments
            print("Seeding Departments...")
            dept_eng = Department(
                id=uuid7(),
                org_id=org.id,
                name="Engineering",
                status=DepartmentStatus.active
            )
            dept_ops = Department(
                id=uuid7(),
                org_id=org.id,
                name="Operations",
                status=DepartmentStatus.active
            )
            session.add_all([dept_eng, dept_ops])
            await session.flush()

            # Seed users
            print("Seeding Users...")
            user_admin = User(
                id=uuid7(),
                org_id=org.id,
                name="Admin User",
                email="admin@acme.com",
                password_hash=get_password_hash("admin12345"),
                role=UserRole.admin,
                status=UserStatus.active
            )
            user_manager = User(
                id=uuid7(),
                org_id=org.id,
                name="Asset Manager",
                email="manager@acme.com",
                password_hash=get_password_hash("manager12345"),
                role=UserRole.asset_manager,
                status=UserStatus.active
            )
            user_head = User(
                id=uuid7(),
                org_id=org.id,
                name="Dept Head User",
                email="head@acme.com",
                password_hash=get_password_hash("head12345"),
                role=UserRole.department_head,
                department_id=dept_eng.id,
                status=UserStatus.active
            )
            user_employee = User(
                id=uuid7(),
                org_id=org.id,
                name="Standard Employee",
                email="employee@acme.com",
                password_hash=get_password_hash("employee12345"),
                role=UserRole.employee,
                department_id=dept_eng.id,
                status=UserStatus.active
            )
            
            session.add_all([user_admin, user_manager, user_head, user_employee])
            await session.flush()

            # Update engineering department head
            dept_eng.department_head_id = user_head.id
            await session.flush()

            # Seed asset categories
            print("Seeding Asset Categories...")
            cat_it = AssetCategory(
                id=uuid7(),
                org_id=org.id,
                name="IT Equipment",
                custom_fields={"has_warranty": True, "manufacturer": "string"},
                status=AssetCategoryStatus.active
            )
            cat_furniture = AssetCategory(
                id=uuid7(),
                org_id=org.id,
                name="Office Furniture",
                custom_fields={"material": "string"},
                status=AssetCategoryStatus.active
            )
            session.add_all([cat_it, cat_furniture])
            await session.flush()

            # Seed assets (~15 assets)
            print("Seeding Assets...")
            assets = []
            
            # Available IT Assets
            for i in range(1, 6):
                assets.append(Asset(
                    id=uuid7(),
                    org_id=org.id,
                    asset_tag=f"AF-{i:04d}",
                    name=f"ThinkPad L14 Gen {i}",
                    category_id=cat_it.id,
                    serial_number=f"L14-GEN{i}-XYZ",
                    acquisition_date=date.today() - timedelta(days=365),
                    acquisition_cost=1200.00,
                    condition=AssetCondition.good,
                    location="HQ-Row-A",
                    is_bookable=False,
                    status=AssetStatus.available,
                    documents=[]
                ))

            # Allocated IT Assets
            asset_alloc_1 = Asset(
                id=uuid7(),
                org_id=org.id,
                asset_tag="AF-0006",
                name="MacBook Pro 16",
                category_id=cat_it.id,
                serial_number="MBP16-M3-MAX",
                acquisition_date=date.today() - timedelta(days=90),
                acquisition_cost=2800.00,
                condition=AssetCondition.new,
                location="Remote",
                is_bookable=False,
                status=AssetStatus.allocated,
                current_holder_type=HolderType.employee,
                current_holder_id=user_employee.id,
                documents=[]
            )
            assets.append(asset_alloc_1)

            asset_alloc_dept = Asset(
                id=uuid7(),
                org_id=org.id,
                asset_tag="AF-0007",
                name="Eng Server Rack A",
                category_id=cat_it.id,
                serial_number="RACK-ENG-A",
                acquisition_date=date.today() - timedelta(days=730),
                acquisition_cost=15000.00,
                condition=AssetCondition.fair,
                location="Server Room 1",
                is_bookable=False,
                status=AssetStatus.allocated,
                current_holder_type=HolderType.department,
                current_holder_id=dept_eng.id,
                documents=[]
            )
            assets.append(asset_alloc_dept)

            # Bookable Assets (Reserved/Available)
            asset_book_1 = Asset(
                id=uuid7(),
                org_id=org.id,
                asset_tag="AF-0008",
                name="Conf Room Projector A",
                category_id=cat_it.id,
                serial_number="PROJ-CONF-A",
                acquisition_date=date.today() - timedelta(days=400),
                acquisition_cost=800.00,
                condition=AssetCondition.good,
                location="Conf Room 4B",
                is_bookable=True,
                status=AssetStatus.available,
                documents=[]
            )
            assets.append(asset_book_1)

            # Under Maintenance Asset
            asset_maint = Asset(
                id=uuid7(),
                org_id=org.id,
                asset_tag="AF-0009",
                name="Dell XPS 15 (Flickering Screen)",
                category_id=cat_it.id,
                serial_number="DELLXPS15-FLK",
                acquisition_date=date.today() - timedelta(days=500),
                acquisition_cost=1800.00,
                condition=AssetCondition.poor,
                location="IT Lab",
                is_bookable=False,
                status=AssetStatus.under_maintenance,
                documents=[]
            )
            assets.append(asset_maint)

            # Furniture Assets
            for i in range(10, 16):
                assets.append(Asset(
                    id=uuid7(),
                    org_id=org.id,
                    asset_tag=f"AF-{i:04d}",
                    name=f"Ergonomic Mesh Chair Model {i}",
                    category_id=cat_furniture.id,
                    serial_number=f"CHAIR-MESH-{i}",
                    acquisition_date=date.today() - timedelta(days=180),
                    acquisition_cost=350.00,
                    condition=AssetCondition.good,
                    location="HQ-Floor-2",
                    is_bookable=False,
                    status=AssetStatus.available,
                    documents=[]
                ))

            session.add_all(assets)
            await session.flush()

            # Seed allocations
            print("Seeding Allocations...")
            alloc_1 = AssetAllocation(
                id=uuid7(),
                org_id=org.id,
                asset_id=asset_alloc_1.id,
                allocated_to_type=HolderType.employee,
                allocated_to_id=user_employee.id,
                allocated_by_id=user_admin.id,
                allocated_at=datetime.now(timezone.utc) - timedelta(days=30),
                expected_return_date=date.today() + timedelta(days=365),
                status=AllocationStatus.active
            )
            alloc_2 = AssetAllocation(
                id=uuid7(),
                org_id=org.id,
                asset_id=asset_alloc_dept.id,
                allocated_to_type=HolderType.department,
                allocated_to_id=dept_eng.id,
                allocated_by_id=user_manager.id,
                allocated_at=datetime.now(timezone.utc) - timedelta(days=60),
                status=AllocationStatus.active
            )
            session.add_all([alloc_1, alloc_2])
            await session.flush()

            # Seed resource bookings
            print("Seeding Bookings...")
            booking_1 = ResourceBooking(
                id=uuid7(),
                org_id=org.id,
                asset_id=asset_book_1.id,
                booked_by_id=user_employee.id,
                start_time=datetime.now(timezone.utc) + timedelta(days=2, hours=9),
                end_time=datetime.now(timezone.utc) + timedelta(days=2, hours=10),
                status=BookingStatus.upcoming,
                created_at=datetime.now(timezone.utc) - timedelta(days=1)
            )
            session.add(booking_1)
            await session.flush()

            # Seed maintenance request
            print("Seeding Maintenance Requests...")
            maint_req = MaintenanceRequest(
                id=uuid7(),
                org_id=org.id,
                asset_id=asset_maint.id,
                raised_by_id=user_employee.id,
                issue_description="Display panel flickers continuously when heated up. Needs repair.",
                priority=MaintenancePriority.high,
                status=MaintenanceStatus.in_progress,
                technician_name="John Repair Guy",
                created_at=datetime.now(timezone.utc) - timedelta(days=3)
            )
            session.add(maint_req)
            await session.flush()

            print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
