import enum
from datetime import date, time, datetime
from sqlalchemy import (
    Column,
    String,
    Date,
    Time,
    Text,
    ForeignKey,
    Enum as SQLEnum,
    Integer,
    Boolean,
    DECIMAL,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates

from app.models.base import IsDeletedModel


class PaymentStatus(str, enum.Enum):
    """Статусы оплаты за поездку"""

    PENDING = "PENDING"
    PAID = "PAID"


class TripStatus(str, enum.Enum):
    """Статусы поездок"""

    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Trip(IsDeletedModel):
    """Модель для хранения информации о поездках"""

    __tablename__ = "trips"

    scheduled_trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("scheduled_trips.id", ondelete="SET NULL"),
        nullable=True,
    )

    customer_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )

    # vehicle_id = Column(
    #     UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=True
    # )

    # driver_id = Column(
    #     UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    # )

    trip_date = Column(Date, nullable=False, comment="Дата поездки")

    departure_time = Column(Time, nullable=False, comment="Время старта")

    departure_location = Column(String(255), nullable=False)

    arrival_location = Column(String(255), nullable=False)

    passenger_count = Column(
        Integer, nullable=False, default=0, comment="Количество пассжаиров"
    )

    is_regular = Column(
        Boolean, default=False, comment="Это регулярный маршрут (госконтракт)?"
    )
    status = Column(SQLEnum(TripStatus), default=TripStatus.PLANNED, nullable=False)

    total_amount = Column(DECIMAL(10, 2), nullable=False, default=0)

    paid_amount = Column(DECIMAL(10, 2), nullable=False, default=0)

    luggage_description = Column(Text, nullable=True)

    payment_status = Column(
        SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False
    )

    show_on_landing = Column(
        Boolean, default=False, nullable=False, comment="Показывать ли поездку на сайте"
    )

    notes = Column(Text, nullable=True)

    stops = relationship(
        "TripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="TripStop.stop_order",
    )

    @validates("passenger_count")
    def validate_passagers_count(self, key, passenger_count):
        if passenger_count <= 0:
            raise ValueError("Должны быть пассажиры")
        return passenger_count

    @property
    def remaining_amount(self):
        return float(self.total_amount) - float(self.paid_amount)


class TripStop(IsDeletedModel):
    __tablename__ = "trip_stops"

    trip_id = Column(
        UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    location = Column(String(255), nullable=False)
    stop_order = Column(Integer, nullable=False)

    trip = relationship("Trip", back_populates="stops")
