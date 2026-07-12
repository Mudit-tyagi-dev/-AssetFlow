import uuid
from typing import Generator, Optional, List
from fastapi import Depends, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_token
from app.core.exceptions import AuthenticationError, ForbiddenError, NotFoundError
from app.models.user import User
from app.repositories.user import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise AuthenticationError("Invalid or expired access token.")
    
    user_id_str = payload.get("user_id")
    if not user_id_str:
        raise AuthenticationError("Token payload missing user_id.")
        
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise AuthenticationError("Malformed user ID in token.")

    user_repo = UserRepository(db)
    user = await user_repo.get(user_id)
    if not user:
        raise AuthenticationError("User not found.")
    
    if user.status != "active":
        raise AuthenticationError("Your account has been deactivated.")

    return user

async def get_current_org(
    current_user: User = Depends(get_current_user)
) -> uuid.UUID:
    if current_user.org_id is None:
        raise ForbiddenError("You must create or belong to an organization to perform this action.")
    return current_user.org_id

def require_role(*roles: str):
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in roles:
            raise ForbiddenError("You do not have the required permissions to perform this action.")
        return current_user
    return dependency

def get_pagination(
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip")
):
    return limit, offset
