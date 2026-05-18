from typing import List, Optional
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.driver import DriverProfile
from app.models.user import User, UserRole
from app.schemas.driver import (
    DriverProfileCreate,
    DriverProfileResponse,
    DriverProfileUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/", response_model=List[DriverProfileResponse])
async def get_drivers(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    is_external: Optional[bool] = None,
    sort_by: Optional[str] = "call_sign",
    sort_dir: Optional[str] = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    q = select(DriverProfile).where(DriverProfile.is_deleted == False)
    if search:
        q = q.where(
            or_(
                DriverProfile.call_sign.ilike(f"%{search}%"),
                DriverProfile.phone.ilike(f"%{search}%"),
            )
        )
    if is_external is not None:
        q = q.where(DriverProfile.is_external == is_external)

    col = getattr(DriverProfile, sort_by, DriverProfile.call_sign)
    if sort_dir == "desc":
        q = q.order_by(desc(col))
    else:
        q = q.order_by(col)

    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post(
    "/",
    response_model=DriverProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_driver(
    data: DriverProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    clean_phone = "".join(filter(str.isdigit, data.phone))
    if not clean_phone.startswith("+"):
        clean_phone = f"+{clean_phone}"

    existing = await db.execute(
        select(DriverProfile).where(
            DriverProfile.phone == clean_phone, DriverProfile.is_deleted == False
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=409, detail="Водитель с таким телефоном уже существует"
        )

    user_stmt = select(User).where(User.phone == clean_phone)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()

    input_dict = data.model_dump()
    first_name = input_dict.get("first_name", "Водитель")
    last_name = input_dict.get("last_name", "")
    call_sign = input_dict.get("call_sign") or first_name

    if not user:
        import uuid

        random_id = str(uuid.uuid4())[:8]
        user = User(
            phone=clean_phone,
            email=f"driver_{random_id}@hibinka.local",
            account_type=UserRole.DRIVER,
            first_name=first_name,
            last_name=last_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()
    else:
        user.account_type = UserRole.DRIVER
        user.first_name = first_name
        user.last_name = last_name
        db.add(user)
        await db.flush()

    driver = DriverProfile(
        user_id=user.id,
        call_sign=call_sign,
        phone=clean_phone,
        is_external=input_dict.get("is_external", False),
    )
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
    result = await db.execute(
        select(DriverProfile).where(
            DriverProfile.id == driver_id, DriverProfile.is_deleted == False
        )
    )
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
    result = await db.execute(
        select(DriverProfile).where(
            DriverProfile.id == driver_id, DriverProfile.is_deleted == False
        )
    )
    driver = result.scalars().first()
    if not driver:
        raise HTTPException(status_code=404, detail="Водитель не найден")
    driver.is_deleted = True
    await db.commit()
    await db.refresh(driver)
    return driver
