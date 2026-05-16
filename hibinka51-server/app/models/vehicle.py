import enum
import uuid
from sqlalchemy import Column, String, Integer, Boolean, Enum, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import IsDeletedModel

class VehicleCategory(str, enum.Enum):
    CAR = "CAR"
    MINIBUS = "MINIBUS"
    BUS = "BUS"

class Vehicle(IsDeletedModel):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    alias = Column(String(50), nullable=False)
    brand = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    category = Column(Enum(VehicleCategory), nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False, server_default=text('false'))

    trips = relationship("Trip", back_populates="vehicle")