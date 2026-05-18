from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import IsDeletedModel


class Organization(IsDeletedModel):
    __tablename__ = "organizations"

    name = Column(String(200), nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    contacts = relationship("Contact", back_populates="organization", lazy="selectin")


class Contact(IsDeletedModel):
    __tablename__ = "contacts"

    phone = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    organization = relationship("Organization", back_populates="contacts", lazy="selectin")
