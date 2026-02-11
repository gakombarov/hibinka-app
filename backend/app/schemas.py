from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date, time
from typing import Optional
import re


class BookingCreate(BaseModel):
    """Схема для создания заявки с лендинга"""

    customer_name: str = Field(min_length=2, max_length=255)
    customer_phone: str
    customer_email: Optional[EmailStr] = None

    desired_trip_date: date
    desired_departure_time: time
    desired_trip_location: str
    arrival_location: str
    passenger_count: int = Field(gt=0, le=50, description="Количество пассажиров")
    luggage_description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Очистка от лишних символов
        phone = re.sub(r"\D", "", v)

        if not re.match(r"^[78]\d{10}$", phone):
            raise ValueError(
                "Неверный формат телефона. Используйте формат: +7 (xxx) xxx-xx-xx"
            )

        # Нормализация к 7
        if phone.startswith("8"):
            phone = "7" + phone[1:]
        return phone

    @field_validator("desired_trip_date")
    @classmethod
    def validate_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Дата поездки не может быть в прошлом")
        return v
