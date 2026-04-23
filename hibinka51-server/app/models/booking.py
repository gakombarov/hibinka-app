import enum
from datetime import date, time
from sqlalchemy import (
    Column,
    DECIMAL,
    String,
    Integer,
    Date,
    Time,
    Text,
    ForeignKey,
    Boolean,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import IsDeletedModel
from app.models.user import User


class BookingSource(str, enum.Enum):
    PHONE = "PHONE"
    EMAIL = "EMAIL"
    WEBSITE = "WEBSITE"
    MESSENGER = "MESSENGER"


class BookingStatus(str, enum.Enum):
    NEW = "NEW"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Booking(IsDeletedModel):
    __tablename__ = "bookings"

    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="Клиент сделавший бронирование",
    )
    customer = relationship("User", backref="bookings")

    trips = relationship("Trip", back_populates="booking", cascade="all, delete-orphan")

    source = Column(
        SQLEnum(BookingSource),
        default=BookingSource.WEBSITE,
        nullable=False,
        comment="Источник заявки",
    )

    # --- Маршрут и Время ---
    desired_trip_date = Column(Date, nullable=False, comment="Дата поездки")
    desired_departure_time = Column(Time, nullable=False, comment="Время отправления")
    desired_trip_location = Column(String(255), nullable=False, comment="Откуда")
    arrival_location = Column(String(255), nullable=False, comment="Куда")

    # --- Обратный рейс ---
    is_round_trip = Column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="Обратный рейс",
    )
    return_date = Column(Date, nullable=True, comment="Дата обратной поездки")
    return_time = Column(Time, nullable=True, comment="Время обратной поездки")

    # --- Детали заказа ---
    passenger_count = Column(Integer, nullable=False, comment="Сколько всего человек")
    luggage_description = Column(Text, nullable=True, comment="Багаж")
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.NEW, nullable=False)
    notes = Column(Text, nullable=True, comment="Заметки")

    # --- Финансы (Единый источник истины) ---
    total_amount = Column(
        DECIMAL(10, 2), nullable=True, default=0, comment="Итого к оплате"
    )
    paid_amount = Column(DECIMAL(10, 2), nullable=True, default=0, comment="Выплачено")

    @property
    def unassigned_passengers(self) -> int:
        """Считает, сколько пассажиров еще не распределено по машинам"""
        if not self.trips:
            return self.passenger_count

        assigned = 0
        for t in self.trips:
            if (
                not t.is_deleted
                and t.status != "CANCELLED"
                and t.trip_date == self.desired_trip_date
            ):
                assigned += self.passenger_count
        remaining = self.passenger_count - assigned
        return max(0, remaining)

    def __repr__(self):
        return f"<Booking {self.id}>"
