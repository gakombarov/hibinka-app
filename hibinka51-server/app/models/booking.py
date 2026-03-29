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

    source = Column(
        SQLEnum(BookingSource),
        default=BookingSource.WEBSITE,
        nullable=False,
        comment="Источник заявки",
    )

    desired_trip_date = Column(
        Date,
        nullable=False,
        comment="Дата когда клиент хочет совершить поездку",
    )

    desired_departure_time = Column(
        Time,
        nullable=False,
        comment="Время отправления по желанию клиента",
    )

    desired_trip_location = Column(
        String(255),
        nullable=False,
        comment="Адрес или название пункта отправления",
    )

    arrival_location = Column(
        String(255),
        nullable=False,
        comment="Адрес или название пункта назначения",
    )

    passenger_count = Column(
        Integer,
        nullable=False,
        comment="Сколько человек планируют поездку",
    )

    luggage_description = Column(
        Text,
        nullable=True,
        comment="Информация о количестве и типе багажа",
    )

    status = Column(
        SQLEnum(BookingStatus),
        default=BookingStatus.NEW,
        nullable=False,
    )

    notes = Column(
        Text,
        nullable=True,
        comment="Дополнительные заметки и пожелания",
    )

    total_amount = Column(DECIMAL(10, 2), nullable=True, default=0, comment="Итого")

    paid_amount = Column(DECIMAL(10, 2), nullable=True, default=0, comment="Выплачено")

    customer = relationship("User", backref="bookings")

    def __repr__(self):
        return f"<Booking {self.id}>"
