from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DriverUserResponse(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DriverProfileCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    call_sign: Optional[str] = None
    phone: str
    is_external: bool = False


class DriverProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    call_sign: Optional[str] = None
    phone: Optional[str] = None
    is_external: Optional[bool] = None


class DriverProfileResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    call_sign: str
    phone: str
    is_external: bool
    user: Optional[DriverUserResponse] = None

    model_config = ConfigDict(from_attributes=True)
