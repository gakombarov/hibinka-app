from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, computed_field
from app.models.trip import TripStatus, PaymentStatus
from app.models.vehicle import VehicleCategory
import enum


class VehicleBase(BaseModel):
    alias: str
    brand: str
    model: str
    license_plate: str
    capacity: int
    category: VehicleCategory
    is_active: bool = True

class TripCustomerInfo(BaseModel):
    first_name: Optional[str] = "Не указано"
    phone: Optional[str] = "Не указано"
    model_config = ConfigDict(from_attributes=True)


class TripBookingInfo(BaseModel):
    total_amount: Optional[float] = 0
    paid_amount: Optional[float] = 0
    customer: Optional[TripCustomerInfo] = None
    model_config = ConfigDict(from_attributes=True)


class TripStopBase(BaseModel):
    location: str
    stop_order: int

class VehicleCreate(VehicleBase):
    customer_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    stops: List[TripStopBase] = []


class TripDriverUpdate(BaseModel):
    status: TripStatus


class VehicleResponse(VehicleBase):
    id: int


class VehicleUpdate(BaseModel):
    alias: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    license_plate: Optional[str] = None
    capacity: Optional[int] = None
    category: Optional[VehicleCategory] = None
    is_active: Optional[bool] = None
