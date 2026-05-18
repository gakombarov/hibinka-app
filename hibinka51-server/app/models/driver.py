import enum
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import IsDeletedModel


class DriverStatus(str, enum.Enum):
    READY = "READY"
    BUSY = "BUSY"
    OFF_DUTY = "OFF_DUTY"


class DriverProfile(IsDeletedModel):
    __tablename__ = "driver_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    call_sign = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    is_external = Column(Boolean, default=False, nullable=False)
    status = Column(SQLEnum(DriverStatus), default=DriverStatus.OFF_DUTY, nullable=False)

    user = relationship("User", lazy="selectin")
