from datetime import date, time
from typing import Optional, List
from uuid import UUID
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    ConfigDict,
)
import re

from app.models.booking import BookingSource, BookingStatus
from app.schemas.trip import TripResponse


class BookingBase(BaseModel):
    desired_trip_date: date
    desired_departure_time: time
    desired_trip_location: str = Field(..., max_length=255)
    arrival_location: str = Field(..., max_length=255)
    passenger_count: int
    luggage_description: Optional[str] = None
    notes: Optional[str] = None

    is_round_trip: bool = False
    return_date: Optional[date] = None
    return_time: Optional[time] = None

    total_amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0


class BookingCreatePublic(BookingBase):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., max_length=25)
    customer_email: Optional[EmailStr] = None

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        phone = re.sub(r"\D", "", v)
        if not re.match(r"^[78]\d{10}$", phone):
            raise ValueError(
                "Неверный формат телефона. Используйте формат: +7 (xxx) xxx-xx-xx"
            )
        if phone.startswith("8"):
            phone = "7" + phone[1:]
        return f"+{phone}"

    @field_validator("passenger_count")
    @classmethod
    def validate_passenger_count(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Количество пассажиров должно быть больше нуля")
        if v > 50:
            raise ValueError("Слишком много пассажиров, свяжитесь с нами напрямую")
        return v

    @field_validator("desired_trip_date")
    @classmethod
    def validate_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Дата поездки не может быть в прошлом")
        return v


class BookingCustomerResponse(BaseModel):
    first_name: str
    phone: str

    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BookingBase):
    id: UUID
    customer_id: UUID
    source: BookingSource
    status: BookingStatus

    customer: Optional[BookingCustomerResponse] = None
    trips: List[TripResponse] = []

    unassigned_passengers: int

    model_config = ConfigDict(from_attributes=True)


class BookingUpdate(BaseModel):
    """Схема для редактирования заявки (для Админа)."""

    status: Optional[BookingStatus] = None

    desired_trip_date: Optional[date] = None
    desired_departure_time: Optional[time] = None
    desired_trip_location: Optional[str] = Field(None, max_length=255)
    arrival_location: Optional[str] = Field(None, max_length=255)

    passenger_count: Optional[int] = None
    luggage_description: Optional[str] = None
    notes: Optional[str] = None

    is_round_trip: Optional[bool] = None
    return_date: Optional[date] = None
    return_time: Optional[time] = None

    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None


class BookingConfirm(BaseModel):
    """Схема для подтверждения заявки администратором (кнопка "Сформировать")."""

    status: BookingStatus = BookingStatus.CONFIRMED
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    notes: Optional[str] = None
    has_trailer: bool = False


class BookingCreateAdmin(BookingCreatePublic):
    """Схема для создания заявки диспетчером (Админом)"""

    source: BookingSource
