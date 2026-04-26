import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import IsDeletedModel


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    DRIVER = "DRIVER"
    CUSTOMER = "CUSTOMER"


class User(IsDeletedModel):
    """User model with roles"""

    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    avatar = Column(
        String,
        nullable=True,
        default="avatars/default.jpg",
        comment="Path to avatar image",
    )
    phone = Column(String, unique=True, index=True, nullable=True)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    account_type = Column(
        SQLEnum(UserRole),
        default=UserRole.CUSTOMER,
        nullable=False,
        comment="User role (ADMIN, DRIVER, CUSTOMER)",
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
