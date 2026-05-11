from datetime import date, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ScheduledTripStopBase(BaseModel):
    stop_order: int = Field(..., description="Порядковый номер остановки")
    location: str = Field(..., min_length=2, description="Название остановки")
    stop_time: Optional[time] = Field(None, description="Время прибытия на остановку")
    description: Optional[str] = Field(
        None, description='Описание (например "У магазина")'
    )


class SchedulerTripStopCreate(ScheduledTripStopBase):
    pass


class ScheduledTripStopResponse(ScheduledTripStopBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class ScheduledTripBase(BaseModel):
    route_number: int = Field(..., description="Номер маршрута")
    departure_location: str = Field(..., min_length=2)
    destination: str = Field(..., min_length=2)
    days_of_week: str = Field(..., description="Например: 'Пн, Ср, Пт'")
    departure_time: time
    price: int = Field(0, description="Рассчитанная стоимость одной поездки")
    notes: Optional[str] = None
    is_active: bool = True
    show_on_landing: bool = False
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    total_contract_value: Optional[int] = None


class ScheduledTripCreate(ScheduledTripBase):
    stops: List[SchedulerTripStopCreate] = []


class ScheduledTripUpdate(BaseModel):
    route_number: Optional[int] = None
    departure_location: Optional[str] = None
    destination: Optional[str] = None
    days_of_week: Optional[str] = None
    departure_time: Optional[time] = None
    price: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    show_on_landing: Optional[bool] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    total_contract_value: Optional[int] = None
    stops: Optional[List[SchedulerTripStopCreate]] = None


class ScheduledTripResponse(ScheduledTripBase):
    id: UUID
    stops: List[ScheduledTripStopResponse] = []
    model_config = ConfigDict(from_attributes=True)
