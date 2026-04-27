from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from uuid import UUID
from typing import List, Optional

from app.api import deps
from app.core.database import get_db
from app.models.customer import Organization, Contact
from app.models.user import User
from app.schemas.customer import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    ContactCreate, ContactUpdate, ContactResponse,
)

router = APIRouter()


# ── Organizations ──────────────────────────────────────────────────────────────

@router.get("/organizations", response_model=List[OrganizationResponse])
async def get_organizations(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    q = select(Organization).where(Organization.is_deleted == False)
    if search:
        q = q.where(Organization.name.ilike(f"%{search}%"))
    if is_active is not None:
        q = q.where(Organization.is_active == is_active)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    org = Organization(**data.model_dump())
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


@router.patch("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    data: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id, Organization.is_deleted == False))
    org = result.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Организация не найдена")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    await db.commit()
    await db.refresh(org)
    return org


@router.delete("/organizations/{org_id}", response_model=OrganizationResponse)
async def delete_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id, Organization.is_deleted == False))
    org = result.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Организация не найдена")
    org.is_deleted = True
    await db.commit()
    return org


# ── Contacts ───────────────────────────────────────────────────────────────────

@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    organization_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    q = select(Contact).where(Contact.is_deleted == False)
    if search:
        q = q.where(or_(Contact.full_name.ilike(f"%{search}%"), Contact.phone.ilike(f"%{search}%")))
    if organization_id:
        q = q.where(Contact.organization_id == organization_id)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    existing = await db.execute(select(Contact).where(Contact.phone == data.phone, Contact.is_deleted == False))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Контакт с таким телефоном уже существует")
    contact = Contact(**data.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.is_deleted == False))
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Контакт не найден")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}", response_model=ContactResponse)
async def delete_contact(
    contact_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.is_deleted == False))
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Контакт не найден")
    contact.is_deleted = True
    await db.commit()
    return contact
