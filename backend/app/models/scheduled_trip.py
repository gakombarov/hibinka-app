from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, Time
from sqlalchemy.orm import relationship
from app.models.base import IsDeletedModel


class ScheduledTrip(IsDeletedModel):
    """Модель регулярных рейсов."""

    __tablename__ = "scheduled_trips"

    route_number = Column(Integer, nullable=False, comment="Номер маршрута")
    departure_location = Column(String, nullable=False, comment="Место отправления")
    destination = Column(String, nullable=False, comment="Место назначения")
    days_of_week = Column(
        String, nullable=False, comment="Дни недели (строкой, например 'Пн, Ср, Пт')"
    )
    departure_time = Column(
        Time, nullable=False, comment="Время отправления из начальной точки"
    )
    price = Column(Integer, nullable=False, comment="Стоимость проезда")
    is_active = Column(Boolean, default=True, comment="Показывать ли рейс на сайте")
    notes = Column(Text, nullable=True, comment="Заметки")

    stops = relationship(
        "ScheduledTripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="ScheduledTripStop.stop_order",
    )


class ScheduledTripStop(IsDeletedModel):
    """
    Модель остановки на регулярном рейсе.
    """

    __tablename__ = "scheduled_trip_stops"

    trip_id = Column(
        ForeignKey("scheduled_trips.id", ondelete="CASCADE"), nullable=False
    )
    stop_order = Column(Integer, nullable=False, comment="Порядковый номер остановки")
    location = Column(String, nullable=False, comment="Название остановки")
    stop_time = Column(Time, nullable=True, comment="Время прибытия на остановку")
    description = Column(
        String, nullable=True, comment="Описание (например 'У магазина')"
    )

    trip = relationship("ScheduledTrip", back_populates="stops")
