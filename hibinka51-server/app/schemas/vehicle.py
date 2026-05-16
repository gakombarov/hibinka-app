from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from enum import Enum

class VehicleCategory(str, Enum):
    CAR = "CAR"
    MINIBUS = "MINIBUS"
    BUS = "BUS"

class VehicleBase(BaseModel):
    alias: str
    brand: str
    model: str
    license_plate: str
    capacity: int
    category: VehicleCategory
    is_active: bool = True

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    alias: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    license_plate: Optional[str] = None
    capacity: Optional[int] = None
    category: Optional[VehicleCategory] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleBase):
    id: UUID
    is_deleted: bool
    model_config = ConfigDict(from_attributes=True)