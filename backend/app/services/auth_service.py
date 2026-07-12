import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import AuthenticationError, ConflictError, NotFoundError
from app.models.org import Organization
from app.models.user import User, RefreshToken
from app.repositories.org import OrganizationRepository
from app.repositories.user import UserRepository, RefreshTokenRepository
from app.schemas.user import OrganizationRegisterRequest, CreateOrganizationRequest, UserSignupRequest, UserLogin
from app.services.utils import log_activity

class AuthService:
    @staticmethod
    async def register_organization(db: AsyncSession, req: OrganizationRegisterRequest) -> User:
        org_repo = OrganizationRepository(db)
        user_repo = UserRepository(db)

        # Check if slug exists
        existing_org = await org_repo.get_by_slug(req.org_slug)
        if existing_org:
            raise ConflictError("Organization slug is already taken.")

        # Check if email is in use in the new org (can't be since org is new, but check globally just in case)
        # Create organization and user in one transaction
        org = Organization(
            id=uuid7(),
            name=req.org_name,
            slug=req.org_slug,
            status="active"
        )
        db.add(org)
        await db.flush()

        admin_user = User(
            id=uuid7(),
            org_id=org.id,
            name=req.admin_name,
            email=req.admin_email,
            password_hash=get_password_hash(req.admin_password),
            role="admin",
            status="active"
        )
        db.add(admin_user)
        await db.flush()

        await log_activity(
            db,
            org_id=org.id,
            actor_id=admin_user.id,
            action="register_organization",
            entity_type="organization",
            entity_id=org.id,
            metadata={"admin_email": req.admin_email}
        )

        return admin_user

    @staticmethod
    async def signup_employee(db: AsyncSession, req: UserSignupRequest) -> User:
        user_repo = UserRepository(db)

        # Check if email is already registered globally
        existing_users = await user_repo.get_by_email_global(req.email)
        if existing_users:
            raise ConflictError("An account with this email already exists.")

        user = User(
            id=uuid7(),
            org_id=None,
            name=req.name,
            email=req.email,
            password_hash=get_password_hash(req.password),
            role="employee",
            status="active"
        )
        db.add(user)
        await db.flush()

        await log_activity(
            db,
            org_id=None,
            actor_id=user.id,
            action="signup_employee",
            entity_type="user",
            entity_id=user.id
        )

        return user

    @staticmethod
    async def create_organization_for_user(
        db: AsyncSession,
        req: CreateOrganizationRequest,
        current_user: User
    ) -> User:
        """Create a new organization and elevate the current user to admin.
        Only allowed if the user has no org yet.
        """
        from app.core.exceptions import ConflictError, ForbiddenError
        if current_user.org_id is not None:
            raise ForbiddenError("You already belong to an organization.")

        org_repo = OrganizationRepository(db)

        # Check slug uniqueness
        existing_org = await org_repo.get_by_slug(req.org_slug)
        if existing_org:
            raise ConflictError("Organization slug is already taken.")

        org = Organization(
            id=uuid7(),
            name=req.org_name,
            slug=req.org_slug,
            status="active"
        )
        db.add(org)
        await db.flush()

        # Upgrade the current user to admin and link to this org
        current_user.org_id = org.id
        current_user.role = "admin"
        db.add(current_user)
        await db.flush()

        await log_activity(
            db,
            org_id=org.id,
            actor_id=current_user.id,
            action="create_organization",
            entity_type="organization",
            entity_id=org.id,
            metadata={"org_slug": req.org_slug}
        )

        return current_user

    @staticmethod
    async def login(db: AsyncSession, req: UserLogin) -> dict:
        user_repo = UserRepository(db)
        token_repo = RefreshTokenRepository(db)

        # Retrieve all users globally with this email
        users = await user_repo.get_by_email_global(req.email)
        if not users:
            raise AuthenticationError("Invalid email or password.")

        # Find the one matching password
        user: Optional[User] = None
        for u in users:
            if verify_password(req.password, u.password_hash):
                user = u
                break

        if not user:
            raise AuthenticationError("Invalid email or password.")

        if user.status != "active":
            raise AuthenticationError("User account is inactive. Please contact support.")

        # Generate tokens
        data = {
            "user_id": str(user.id),
            "org_id": str(user.org_id) if user.org_id else None,
            "role": user.role.value
        }
        access_token = create_access_token(data)
        refresh_token_str = create_refresh_token(data)

        # Save refresh token
        # Using sha256 to hash token before storage
        import hashlib
        token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
        
        db_token = RefreshToken(
            id=uuid7(),
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            revoked=False
        )
        db.add(db_token)
        await db.flush()

        await log_activity(
            db,
            org_id=user.org_id,
            actor_id=user.id,
            action="login",
            entity_type="user",
            entity_id=user.id
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer"
        }

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> dict:
        token_repo = RefreshTokenRepository(db)
        user_repo = UserRepository(db)

        # Hash refresh token
        import hashlib
        token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()

        db_token = await token_repo.get_by_token_hash(token_hash)
        if not db_token or db_token.revoked or db_token.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Invalid or expired refresh token.")

        # Decode token payload
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise AuthenticationError("Invalid refresh token payload.")

        user_id = uuid.UUID(payload["user_id"])
        user = await user_repo.get(user_id)
        if not user or user.status != "active":
            raise AuthenticationError("User account is inactive or not found.")

        # Revoke old token (token rotation)
        db_token.revoked = True
        await token_repo.create(db_token)

        # Generate new tokens
        data = {
            "user_id": str(user.id),
            "org_id": str(user.org_id) if user.org_id else None,
            "role": user.role.value
        }
        new_access_token = create_access_token(data)
        new_refresh_token_str = create_refresh_token(data)

        # Save new refresh token
        new_token_hash = hashlib.sha256(new_refresh_token_str.encode()).hexdigest()
        new_db_token = RefreshToken(
            id=uuid7(),
            user_id=user.id,
            token_hash=new_token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            revoked=False
        )
        db.add(new_db_token)
        await db.flush()

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token_str,
            "token_type": "bearer"
        }

    @staticmethod
    async def logout(db: AsyncSession, refresh_token_str: str) -> None:
        token_repo = RefreshTokenRepository(db)
        import hashlib
        token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
        db_token = await token_repo.get_by_token_hash(token_hash)
        if db_token:
            db_token.revoked = True
            db.add(db_token)
            await db.flush()
