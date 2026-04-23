from typing import List, Optional
from datetime import time
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class ScheduledTripStopBase(BaseModel):
    stop_order: int = Field(..., description="Порядковый номер остановки")
    location: str = Field(..., min_length=2, description="Название остановки")
    stop_time: Optional[time] = Field(None, description="Время прибытия на остановку")
    description: Optional[str] = Field(
        None, description='Описание (например "У магазина")'
    )


class SchedulerTripStopCreate(ScheduledTripStopBase):
    """Схема для создания остановки."""

    pass


class ScheduledTripStopResponse(ScheduledTripStopBase):
    """Схема для ответа с данными об остановке."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)


class ScheduledTripBase(BaseModel):
    """Базовая схема для регулярного рейса."""

    route_number: int = Field(..., description="Номер маршрута")
    departure_location: str = Field(..., min_length=2, description="Место отправления")
    destination: str = Field(..., min_length=2, description="Место назначения")
    days_of_week: str = Field(..., min_length=2, description="Дни недели")
    departure_time: time = Field(
        ..., description="Время отправления из начальной точки"
    )
    price: int = Field(..., description="Стоимость проезда")
    notes: Optional[str] = None
    is_active: bool = True


class ScheduledTripCreate(ScheduledTripBase):
    """Схема для создания рейса (включает список остановок)."""

    stops: List[SchedulerTripStopCreate] = []


class ScheduledTripResponse(ScheduledTripBase):
    """Схема для ответа (включает список остановок с ID)."""

    id: UUID
    stops: List[ScheduledTripStopResponse] = []

    model_config = ConfigDict(from_attributes=True)
