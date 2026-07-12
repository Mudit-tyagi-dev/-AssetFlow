from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from app.repositories.base import BaseRepository
from app.models.user import User, RefreshToken

class UserRepository(BaseRepository[User]):
    def __init__(self, db):
        super().__init__(User, db)

    async def get_by_email(self, email: str, org_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.org_id == org_id, User.email == email)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_email_global(self, email: str) -> List[User]:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id_and_org(self, id: UUID, org_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == id, User.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_users_by_org(self, org_id: UUID, search: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[User]:
        stmt = select(User).where(User.org_id == org_id)
        if search:
            stmt = stmt.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        stmt = stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_users_by_org(self, org_id: UUID, search: Optional[str] = None) -> int:
        stmt = select(func.count()).select_from(User).where(User.org_id == org_id)
        if search:
            stmt = stmt.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        result = await self.db.execute(stmt)
        return result.scalar() or 0


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db):
        super().__init__(RefreshToken, db)

    async def get_by_token_hash(self, token_hash: str) -> Optional[RefreshToken]:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False)
        result = await self.db.execute(stmt)
        return result.scalars().first()
