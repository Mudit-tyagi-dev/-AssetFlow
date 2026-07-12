import asyncio
import pytest
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport

from app.core.db import get_db
from app.core.security import get_password_hash, create_access_token
from app.main import app
from app.models import Base
from app.models.org import Organization, Department
from app.models.user import User
from app.models.enums import UserRole, UserStatus
from app.core.uuid import uuid7

# Strip Postgres-specific details from metadata for SQLite compatibility in tests
def strip_postgres_details(metadata):
    from sqlalchemy.dialects.postgresql import ExcludeConstraint, JSONB
    from sqlalchemy import JSON
    for table in metadata.tables.values():
        # Remove ExcludeConstraints (which require btree_gist and tstzrange in Postgres)
        exclude_constraints = [c for c in table.constraints if isinstance(c, ExcludeConstraint)]
        for c in exclude_constraints:
            table.constraints.remove(c)
        # Convert JSONB to JSON for SQLite compatibility
        for column in table.columns:
            if isinstance(column.type, JSONB):
                column.type = JSON()
        # Strip PG-specific Index options safely
        for index in list(table.indexes):
            if hasattr(index, "dialect_options") and "postgresql" in index.dialect_options:
                try:
                    del index.dialect_options["postgresql"]
                except Exception:
                    pass

strip_postgres_details(Base.metadata)

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    async with AsyncSessionLocal() as session:
        yield session
        
    # Clean up all table contents in reverse topological order
    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())

@pytest.fixture
async def client(engine, db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    # Override get_db dependency to yield a fresh session for each request (matches production)
    async def override_get_db():
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
        async with AsyncSessionLocal() as session:
            original_begin = session.begin
            def safe_begin(*args, **kwargs):
                if session.in_transaction():
                    return session.begin_nested()
                return original_begin(*args, **kwargs)
            session.begin = safe_begin
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
async def seed_data(db_session: AsyncSession):
    # Seed a basic multi-tenant environment: Org A, Org B
    # Org A
    org_a = Organization(id=uuid7(), name="Org A", slug="orga", status="active")
    db_session.add(org_a)
    
    # Org B
    org_b = Organization(id=uuid7(), name="Org B", slug="orgb", status="active")
    db_session.add(org_b)
    await db_session.flush()

    # Department
    dept_a = Department(id=uuid7(), org_id=org_a.id, name="Eng A", status="active")
    db_session.add(dept_a)
    await db_session.flush()

    # Users Org A
    admin_a = User(
        id=uuid7(),
        org_id=org_a.id,
        name="Admin A",
        email="admin_a@test.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.admin,
        status=UserStatus.active
    )
    manager_a = User(
        id=uuid7(),
        org_id=org_a.id,
        name="Manager A",
        email="manager_a@test.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.asset_manager,
        status=UserStatus.active
    )
    employee_a = User(
        id=uuid7(),
        org_id=org_a.id,
        name="Employee A",
        email="employee_a@test.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.employee,
        department_id=dept_a.id,
        status=UserStatus.active
    )
    
    # User Org B
    admin_b = User(
        id=uuid7(),
        org_id=org_b.id,
        name="Admin B",
        email="admin_b@test.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.admin,
        status=UserStatus.active
    )
    employee_b = User(
        id=uuid7(),
        org_id=org_b.id,
        name="Employee B",
        email="employee_b@test.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.employee,
        status=UserStatus.active
    )

    db_session.add_all([admin_a, manager_a, employee_a, admin_b, employee_b])
    await db_session.commit()

    # Generate JWT Tokens
    token_admin_a = create_access_token({"user_id": str(admin_a.id), "org_id": str(org_a.id), "role": "admin"})
    token_manager_a = create_access_token({"user_id": str(manager_a.id), "org_id": str(org_a.id), "role": "asset_manager"})
    token_employee_a = create_access_token({"user_id": str(employee_a.id), "org_id": str(org_a.id), "role": "employee"})
    token_admin_b = create_access_token({"user_id": str(admin_b.id), "org_id": str(org_b.id), "role": "admin"})
    token_employee_b = create_access_token({"user_id": str(employee_b.id), "org_id": str(org_b.id), "role": "employee"})

    return {
        "org_a": org_a,
        "org_b": org_b,
        "dept_a": dept_a,
        "admin_a": admin_a,
        "manager_a": manager_a,
        "employee_a": employee_a,
        "admin_b": admin_b,
        "employee_b": employee_b,
        "tokens": {
            "admin_a": token_admin_a,
            "manager_a": token_manager_a,
            "employee_a": token_employee_a,
            "admin_b": token_admin_b,
            "employee_b": token_employee_b,
        }
    }
