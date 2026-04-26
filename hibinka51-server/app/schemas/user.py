from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID

from app.models.user import UserRole


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    account_type: Optional[UserRole] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    email: EmailStr
    password: str
    account_type: UserRole = UserRole.CUSTOMER


class UserUpdate(UserBase):
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: UUID
    full_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
