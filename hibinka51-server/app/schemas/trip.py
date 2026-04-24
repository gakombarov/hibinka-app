from datetime import date, time
from typing import Optional, List
from uuid import UUID

from app.models.trip import TripStatus, PaymentStatus
from pydantic import BaseModel, Field, ConfigDict, computed_field


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


class TripBase(BaseModel):
    trip_date: date
    departure_time: time
    departure_location: str = Field(..., max_length=255)
    arrival_location: str = Field(..., max_length=255)
    passenger_count: Optional[int] = 0

    is_regular: bool = False
    status: TripStatus = TripStatus.PLANNED
    payment_status: PaymentStatus = PaymentStatus.PENDING
    show_on_landing: bool = False
    has_trailer: bool = False
    notes: Optional[str] = None
    total_amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0


class TripCreate(TripBase):
    customer_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    stops: List[TripStopBase] = []


class TripDriverUpdate(BaseModel):
    status: TripStatus


class TripResponse(TripBase):
    id: UUID
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    stops: List[TripStopBase] = []

    customer: Optional[TripCustomerInfo] = None
    booking: Optional[TripBookingInfo] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def display_status(self) -> str:
        if self.status == TripStatus.IN_PROGRESS:
            return "В пути"
        elif self.status == TripStatus.COMPLETED:
            return "Завершен"
        elif self.status == TripStatus.CANCELLED:
            return "Отменен"
        return "По расписанию"


class TripUpdate(BaseModel):
    customer_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None

    trip_date: Optional[date] = None
    departure_time: Optional[time] = None
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None

    passenger_count: Optional[int] = None
    has_trailer: Optional[bool] = None

    status: Optional[TripStatus] = None
    payment_status: Optional[PaymentStatus] = None
    notes: Optional[str] = None

    stops: Optional[List[TripStopBase]] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
