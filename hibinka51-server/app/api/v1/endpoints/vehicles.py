from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload, joinedload
from uuid import UUID
from typing import List

from app.api import deps
from app.core.database import get_db
from app.models.vehicle import Vehicle, VehicleCategory
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.vehicle import VehicleResponse, VehicleUpdate, VehicleCreate

from typing import Any
router = APIRouter()


@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = None,
    sort_dir: str = None,
    category: VehicleCategory = None,
    min_capacity: int = 0,
    is_active: bool = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    try:
        """ПОЛУЧЕНИЕ ВСЕГО АВТОПАРКА"""
        query = (
            select(Vehicle)
            .where(
                Vehicle.is_deleted == False,
                Vehicle.category == category if category else True,
                Vehicle.is_active == is_active if is_active != None else True,
                Vehicle.capacity >= min_capacity if min_capacity != None else True,
            )
            .order_by(sort_by if sort_dir == 'asc' else desc(sort_by))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()
    except Exception as e:
        print("Ошибка при получении списка транспортных средств:", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    return vehicle

@router.post(
    "/",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    db: AsyncSession = Depends(get_db),
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

        query = (
            select(Vehicle)
            .where(Vehicle.id == vehicle.id)
        )
        result = await db.execute(query)
        full_vehicle = result.scalars().first()
        return full_vehicle
    except Exception as e:
        print("Ошибка при добавлении транспортного средства:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    for field, value in vehicle_in.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    await db.commit()
    await db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", response_model=VehicleResponse)
async def delete_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Транспортное средство не найдено")

    vehicle.is_deleted = True
    await db.commit()
    return vehicle