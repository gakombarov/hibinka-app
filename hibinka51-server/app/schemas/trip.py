from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, computed_field

from app.models.trip import TripStatus, PaymentStatus


class TripStopBase(BaseModel):
    location: str
    stop_order: int


class TripBase(BaseModel):
    trip_date: date
    departure_time: time
    departure_location: str = Field(..., max_length=255)
    arrival_location: str = Field(..., max_length=255)

    is_regular: bool = False
    status: TripStatus = TripStatus.PLANNED
    planned_amount: float = 0.0
    actual_amount: Optional[float] = None
    payment_status: PaymentStatus = PaymentStatus.PENDING
    show_on_landing: bool = False
    notes: Optional[str] = None

    passenger_count: Optional[int] = 0


class TripCreate(TripBase):
    """Схема для создания поездки"""

    customer_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    stops: List[TripStopBase] = []


class TripDriverUpdate(BaseModel):
    """Схема для ВОДИТЕЛЯ (он может менять только статус)"""

    status: TripStatus


class TripResponse(TripBase):
    """Ответ для Дашборда и Лэндинга"""

    id: UUID
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None
    stops: List[TripStopBase] = []

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def display_status(self) -> str:
        """
        Вычисляет статус для отображения на Лэндинге.
        """
        if self.status == TripStatus.IN_PROGRESS:
            return "В пути"
        elif self.status == TripStatus.COMPLETED:
            return "Завершен"
        elif self.status == TripStatus.CANCELLED:
            return "Отменен"

        # if self.status == TripStatus.PLANNED:
        #     trip_datetime = datetime.combine(self.trip_date, self.departure_time)
        #     if datetime.now() > trip_datetime:
        #         return "Задерживается"
        return "По расписанию"


class TripUpdate(BaseModel):
    """
    Схема для ОБНОВЛЕНИЯ поездки в Журнале.
    """

    customer_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    driver_id: Optional[UUID] = None
    scheduled_trip_id: Optional[UUID] = None

    trip_date: Optional[date] = None
    departure_time: Optional[time] = None
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None

    status: Optional[TripStatus] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    payment_status: Optional[PaymentStatus] = None
    notes: Optional[str] = None

    stops: Optional[List[TripStopBase]] = None
