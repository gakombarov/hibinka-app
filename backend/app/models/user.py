import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import IsDeletedModel


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DRIVER = "driver"
    CUSTOMER = "customer"


class User(IsDeletedModel):
    """User model with roles"""

    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    role = Column(
        SQLEnum(UserRole),
        default=UserRole.CUSTOMER,
        nullable=False,
        comment="User role",
    )
