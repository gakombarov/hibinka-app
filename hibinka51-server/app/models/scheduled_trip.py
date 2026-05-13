import uuid

from app.core.database import Base
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID  # <-- ВОТ ЭТОТ ИМПОРТ РЕШИТ ПРОБЛЕМУ
from sqlalchemy.orm import relationship


class ScheduledTrip(Base):
    __tablename__ = "scheduled_trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_number = Column(Integer, nullable=False)
    client_name = Column(String, nullable=True)
    departure_location = Column(String, nullable=False)
    destination = Column(String, nullable=False)

    total_contract_value = Column(Integer, nullable=False)
    contract_start_date = Column(Date, nullable=False)
    contract_end_date = Column(Date, nullable=False)

    price = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    show_on_landing = Column(Boolean, default=False)
    notes = Column(String, nullable=True)

    cycles = relationship(
        "ScheduledTripCycle", back_populates="schedule", cascade="all, delete-orphan"
    )
    stops = relationship(
        "ScheduledTripStop", back_populates="schedule", cascade="all, delete-orphan"
    )


class ScheduledTripCycle(Base):
    __tablename__ = "scheduled_trip_cycles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(
        UUID(as_uuid=True), ForeignKey("scheduled_trips.id", ondelete="CASCADE")
    )

    days_of_week = Column(String, nullable=False)
    departure_time = Column(Time, nullable=False)
    return_time = Column(Time, nullable=False)

    schedule = relationship("ScheduledTrip", back_populates="cycles")


class ScheduledTripStop(Base):
    __tablename__ = "scheduled_trip_stops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(
        UUID(as_uuid=True), ForeignKey("scheduled_trips.id", ondelete="CASCADE")
    )

    location = Column(String, nullable=False)
    stop_time = Column(Time, nullable=True)
    stop_order = Column(Integer, default=0)
    description = Column(String, nullable=True)

    schedule = relationship("ScheduledTrip", back_populates="stops")
