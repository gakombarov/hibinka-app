from datetime import date, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ScheduledTripStopBase(BaseModel):
    location: str
    stop_time: Optional[time] = None
    stop_order: int = 0
    description: Optional[str] = None


class ScheduledTripStopCreate(ScheduledTripStopBase):
    pass


class ScheduledTripStopResponse(ScheduledTripStopBase):
    id: UUID
    schedule_id: UUID
    model_config = ConfigDict(from_attributes=True)


class ScheduledTripCycleBase(BaseModel):
    days_of_week: str  # "Пн, Ср, Пт"
    departure_time: time
    return_time: time


class ScheduledTripCycleCreate(ScheduledTripCycleBase):
    pass


class ScheduledTripCycleResponse(ScheduledTripCycleBase):
    id: UUID
    schedule_id: UUID
    model_config = ConfigDict(from_attributes=True)


class ScheduledTripBase(BaseModel):
    route_number: int
    client_name: Optional[str] = None
    departure_location: str
    destination: str
    total_contract_value: int
    contract_start_date: date
    contract_end_date: date
    is_active: bool = True
    show_on_landing: bool = False
    notes: Optional[str] = None


class ScheduledTripCreate(ScheduledTripBase):
    cycles: List[ScheduledTripCycleCreate]
    stops: Optional[List[ScheduledTripStopCreate]] = []


class ScheduledTripUpdate(BaseModel):
    route_number: Optional[int] = None
    client_name: Optional[str] = None
    departure_location: Optional[str] = None
    destination: Optional[str] = None
    total_contract_value: Optional[int] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    is_active: Optional[bool] = None
    show_on_landing: Optional[bool] = None
    notes: Optional[str] = None
    cycles: Optional[List[ScheduledTripCycleCreate]] = None
    stops: Optional[List[ScheduledTripStopCreate]] = None


class ScheduledTripResponse(ScheduledTripBase):
    id: UUID
    price: int  # Возвращаем рассчитанную сервером цену за 1 цикл
    cycles: List[ScheduledTripCycleResponse] = []
    stops: List[ScheduledTripStopResponse] = []
    model_config = ConfigDict(from_attributes=True)
