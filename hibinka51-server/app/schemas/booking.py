from datetime import date, time
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

from app.models.booking import BookingSource, BookingStatus


class BookingBase(BaseModel):
    """
    Базовая схема с общими полями для бронирования.
    """

    desired_trip_date: date
    desired_departure_time: time
    desired_trip_location: str = Field(..., max_length=255)
    arrival_location: str = Field(..., max_length=255)
    passenger_count: int
    luggage_description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class BookingCreatePublic(BookingBase):
    """Схема для создания публичной заявки на лэндинге"""

    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., max_length=25)
    customer_email: Optional[EmailStr] = None

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Валидация и нормализация номера телефона"""
        phone = re.sub(r"\D", "", v)

        if len(phone) == 10:
            phone = "7" + phone
        elif len(phone) == 11 and phone.startswith("8"):
            phone = "7" + phone[1:]

        if not re.match(r"^7\d{10}$", phone):
            raise ValueError("Введите корректный номер телефона (11 цифр)")

        return f"+{phone}"

    @field_validator("passenger_count")
    @classmethod
    def validate_passenger_count(cls, v: int) -> int:
        """Проверка количества пассажиров"""
        if v <= 0:
            raise ValueError("Количество пассажиров должно быть больше нуля")
        if v > 50:
            raise ValueError(
                "Количество пассажиров слишком большое, свяжитесь с нами напрямую"
            )
        return v

    @field_validator("desired_trip_date")
    @classmethod
    def validate_date(cls, v: date) -> date:
        """Проверка, что дата не в прошлом"""
        if v < date.today():
            raise ValueError("Дата поездки не может быть в прошлом")
        return v


class BookingUpdate(BaseModel):
    """Схема для частичного обновления бронирования"""

    desired_trip_date: Optional[date] = None
    desired_departure_time: Optional[time] = None
    desired_trip_location: Optional[str] = Field(None, max_length=255)
    arrival_location: Optional[str] = Field(None, max_length=255)
    passenger_count: Optional[int] = None
    luggage_description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[BookingStatus] = None


class BookingCustomerResponse(BaseModel):
    """Схема для вложенных данных клиента"""

    first_name: str
    phone: str

    class Config:
        from_attributes = True


class BookingResponse(BookingBase):
    """Схема для ответа API с данными о бронировании"""

    id: UUID
    customer_id: UUID
    source: BookingSource
    status: BookingStatus

    customer: Optional[BookingCustomerResponse] = None

    class Config:
        from_attributes = True


class BookingConfirm(BaseModel):
    total_amount: float = Field(..., description="Итоговая цена поездки")
    paid_amount: float = Field(0.0, description="Уже выплачено (аванс)")
