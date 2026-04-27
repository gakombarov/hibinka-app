from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.driver import DriverStatus


class DriverProfileCreate(BaseModel):
    call_sign: str
    phone: str
    is_external: bool = False
    status: DriverStatus = DriverStatus.OFF_DUTY
    user_id: Optional[UUID] = None


class DriverProfileUpdate(BaseModel):
    call_sign: Optional[str] = None
    phone: Optional[str] = None
    is_external: Optional[bool] = None
    status: Optional[DriverStatus] = None
    user_id: Optional[UUID] = None


class DriverProfileResponse(DriverProfileCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
