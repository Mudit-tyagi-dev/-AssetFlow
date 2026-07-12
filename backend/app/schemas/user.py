from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole, UserStatus

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., max_length=255)
    org_id: uuid.UUID

class UserSignupRequest(BaseModel):
    org_id: uuid.UUID
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., max_length=255)

class OrganizationRegisterRequest(BaseModel):
    org_name: str = Field(..., max_length=255)
    org_slug: str = Field(..., max_length=100)
    admin_name: str = Field(..., max_length=255)
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    department_id: Optional[uuid.UUID] = None

class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    department_id: Optional[uuid.UUID] = None

class UserRead(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    email: str
    role: UserRole
    department_id: Optional[uuid.UUID]
    status: UserStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class PasswordForgotRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
