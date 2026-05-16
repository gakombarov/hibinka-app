from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from typing import List, Any

from app.api import deps
from app.core.database import get_db
from app.models.vehicle import Vehicle, VehicleCategory
from app.schemas.vehicle import VehicleResponse, VehicleUpdate, VehicleCreate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
        skip: int = 0,
        limit: int = 100,
        sort_by: str = None,
        sort_dir: str = None,
        category: VehicleCategory = None,
        min_capacity: int = None,
        is_active: bool = None,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_active_user),
):
    try:
        query = select(Vehicle).where(Vehicle.is_deleted == False)
        if category:
            query = query.where(Vehicle.category == category)
        if is_active is not None:
            query = query.where(Vehicle.is_active == is_active)
        if min_capacity is not None:
            query = query.where(Vehicle.capacity >= min_capacity)
        if sort_by:
            attr = getattr(Vehicle, sort_by, None)
            if attr:
                query = query.order_by(desc(attr) if sort_dir == 'desc' else attr)
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
        vehicle_id: UUID,  # Исправлено на UUID
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
        vehicle_in: VehicleCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),  # Не забудь авторизацию, если нужно
) -> Any:
    try:
        vehicle = Vehicle(
            alias=vehicle_in.alias,
            brand=vehicle_in.brand,
            model=vehicle_in.model,
            license_plate=vehicle_in.license_plate,
            capacity=vehicle_in.capacity,
            category=vehicle_in.category,
            is_active=vehicle_in.is_active,
        )

        db.add(vehicle)
        await db.commit()
        await db.refresh(vehicle)

        return vehicle

    except IntegrityError as e:
        await db.rollback()
        error_msg = str(e.orig).lower()

        if "license_plate" in error_msg:
            detail = f"Транспортное средство с номером '{vehicle_in.license_plate}' уже существует."
        elif "alias" in error_msg:
            detail = f"Транспортное средство с названием '{vehicle_in.alias}' уже существует."
        else:
            detail = "Ошибка уникальности данных."

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    except Exception as e:
        await db.rollback()
        print("Непредвиденная ошибка при добавлении ТС:", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
        vehicle_id: UUID,
        vehicle_in: VehicleUpdate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    try:
        for field, value in vehicle_in.model_dump(exclude_unset=True).items():
            setattr(vehicle, field, value)

        await db.commit()
        await db.refresh(vehicle)
        return vehicle
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Гос. номер или алиас уже заняты другим ТС.")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{vehicle_id}", response_model=VehicleResponse)
async def delete_vehicle(
        vehicle_id: UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    vehicle.is_deleted = True
    await db.commit()
    return vehicle
