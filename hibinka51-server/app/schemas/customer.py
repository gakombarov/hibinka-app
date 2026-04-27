from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class OrganizationCreate(BaseModel):
    name: str
    notes: Optional[str] = None
    is_active: bool = True


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class ContactCreate(BaseModel):
    phone: str
    full_name: str
    organization_id: Optional[UUID] = None
    user_id: Optional[UUID] = None


class ContactUpdate(BaseModel):
    phone: Optional[str] = None
    full_name: Optional[str] = None
    organization_id: Optional[UUID] = None
    user_id: Optional[UUID] = None


class ContactResponse(ContactCreate):
    id: UUID
    organization: Optional[OrganizationResponse] = None
    model_config = ConfigDict(from_attributes=True)
