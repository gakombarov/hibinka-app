from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import declarative_base
import enum
from app.models.base import IsDeletedModel

Base = declarative_base()

class VehicleCategory(str, enum.Enum):
    BUS = "BUS"
    MINIBUS = "MINIBUS"

class Vehicle(IsDeletedModel):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    alias = Column(String(50), nullable=False)
    brand = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    category = Column(Enum(VehicleCategory), nullable=False)
    is_active = Column(Boolean, default=True)
    # year = Column(Integer, nullable=False)
    is_deleted = Column(Boolean, default=False)