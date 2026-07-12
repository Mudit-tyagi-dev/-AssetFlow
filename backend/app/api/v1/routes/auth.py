from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas.user import (
    OrganizationRegisterRequest,
    UserSignupRequest,
    UserLogin,
    Token,
    TokenRefreshRequest,
    UserRead,
    PasswordForgotRequest,
    PasswordResetRequest,
)
from app.services.auth_service import AuthService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register-organization", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_organization(
    req: OrganizationRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new organization and its first Admin user."""
    async with db.begin():
        admin_user = await AuthService.register_organization(db, req)
        return admin_user

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(
    req: UserSignupRequest,
    db: AsyncSession = Depends(get_db)
):
    """Sign up a new User with Employee role."""
    async with db.begin():
        user = await AuthService.signup_employee(db, req)
        return user

@router.post("/login", response_model=Token)
async def login(
    req: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate email and password globally, returning access and refresh tokens."""
    async with db.begin():
        token_data = await AuthService.login(db, req)
        return token_data

@router.post("/refresh", response_model=Token)
async def refresh(
    req: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """Refresh an access token using a valid, unrevoked refresh token."""
    async with db.begin():
        token_data = await AuthService.refresh_tokens(db, req.refresh_token)
        return token_data

@router.get("/me", response_model=UserRead)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get the currently logged-in user's profile."""
    return current_user

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    req: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """Revoke a refresh token, logging the user out."""
    async with db.begin():
        await AuthService.logout(db, req.refresh_token)
        return {"message": "Successfully logged out."}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    req: PasswordForgotRequest
):
    """Mock request to initiate password recovery email."""
    return {"message": f"Password reset email sent to {req.email} if it exists."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    req: PasswordResetRequest
):
    """Mock request to finalize password recovery using token."""
    return {"message": "Password has been reset successfully."}
