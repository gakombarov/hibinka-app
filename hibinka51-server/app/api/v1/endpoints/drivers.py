from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from uuid import UUID
from typing import List, Optional

from app.api import deps
from app.core.database import get_db
from app.models.driver import DriverProfile, DriverStatus
from app.models.user import User
from app.schemas.driver import DriverProfileCreate, DriverProfileUpdate, DriverProfileResponse

router = APIRouter()


@router.get("/", response_model=List[DriverProfileResponse])
async def get_drivers(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[DriverStatus] = None,
    is_external: Optional[bool] = None,
    sort_by: Optional[str] = "call_sign",
    sort_dir: Optional[str] = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    q = select(DriverProfile).where(DriverProfile.is_deleted == False)
    if search:
        q = q.where(or_(
            DriverProfile.call_sign.ilike(f"%{search}%"),
            DriverProfile.phone.ilike(f"%{search}%"),
        ))
    if status is not None:
        q = q.where(DriverProfile.status == status)
    if is_external is not None:
        q = q.where(DriverProfile.is_external == is_external)

    col = getattr(DriverProfile, sort_by, DriverProfile.call_sign)
    q = q.order_by(col if sort_dir == "asc" else desc(col))
    q = q.offset(skip).limit(limit)

    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{driver_id}", response_model=DriverProfileResponse)
async def get_driver(
    driver_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(DriverProfile).where(DriverProfile.id == driver_id, DriverProfile.is_deleted == False))
    driver = result.scalars().first()
    if not driver:
        raise HTTPException(status_code=404, detail="Водитель не найден")
    return driver


@router.post("/", response_model=DriverProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(
    data: DriverProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    existing = await db.execute(select(DriverProfile).where(DriverProfile.phone == data.phone, DriverProfile.is_deleted == False))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Водитель с таким телефоном уже существует")
    driver = DriverProfile(**data.model_dump())
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    return driver


@router.patch("/{driver_id}", response_model=DriverProfileResponse)
async def update_driver(
    driver_id: UUID,
    data: DriverProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(DriverProfile).where(DriverProfile.id == driver_id, DriverProfile.is_deleted == False))
    driver = result.scalars().first()
    if not driver:
        raise HTTPException(status_code=404, detail="Водитель не найден")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    await db.commit()
    await db.refresh(driver)
    return driver


@router.delete("/{driver_id}", response_model=DriverProfileResponse)
async def delete_driver(
    driver_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(DriverProfile).where(DriverProfile.id == driver_id, DriverProfile.is_deleted == False))
    driver = result.scalars().first()
    if not driver:
        raise HTTPException(status_code=404, detail="Водитель не найден")
    driver.is_deleted = True
    await db.commit()
    return driver
