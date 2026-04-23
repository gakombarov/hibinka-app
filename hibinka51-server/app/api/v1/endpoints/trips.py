from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from uuid import UUID
from typing import List

from app.api import deps
from app.core.database import get_db
from app.models.trip import Trip, TripStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.trip import TripResponse, TripUpdate, TripCreate

router = APIRouter()


@router.get("/", response_model=List[TripResponse])
async def get_trips(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """ПОЛУЧЕНИЕ ВСЕХ ПОЕЗДОК"""
    query = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking).joinedload(Booking.customer),
            joinedload(Trip.customer),
        )
        .where(Trip.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """ПОЛУЧЕНИЕ ОДНОЙ ПОЕЗДКИ"""
    query = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking).joinedload(Booking.customer),
            joinedload(Trip.customer),
        )
        .where(Trip.id == trip_id, Trip.is_deleted == False)
    )

    result = await db.execute(query)
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    return trip


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: UUID,
    trip_in: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """ОБНОВЛЕНИЕ ПОЕЗДКИ (Умная синхронизация)"""

    query = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking).joinedload(Booking.customer),
            joinedload(Trip.customer),
        )
        .where(Trip.id == trip_id, Trip.is_deleted == False)
    )

    result = await db.execute(query)
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    update_data = trip_in.model_dump(exclude_unset=True)

    if "passenger_count" in update_data and trip.booking:
        siblings_query = select(Trip).where(
            Trip.booking_id == trip.booking_id, Trip.is_deleted == False
        )
        siblings_result = await db.execute(siblings_query)
        siblings = siblings_result.scalars().all()

        if len(siblings) == 1:
            trip.booking.passenger_count = update_data["passenger_count"]
            db.add(trip.booking)

    for field, value in update_data.items():
        if field != "stops":
            setattr(trip, field, value)

    db.add(trip)
    await db.flush()

    if trip.booking_id and trip.status == TripStatus.COMPLETED:
        all_trips_query = select(Trip.status).where(
            Trip.booking_id == trip.booking_id, Trip.is_deleted == False
        )
        all_statuses = (await db.execute(all_trips_query)).scalars().all()

        if not any(
            s in [TripStatus.PLANNED, TripStatus.IN_PROGRESS] for s in all_statuses
        ):
            booking = await db.get(Booking, trip.booking_id)
            if booking and booking.status != BookingStatus.COMPLETED:
                booking.status = BookingStatus.COMPLETED
                db.add(booking)

    await db.commit()

    res = await db.execute(query)
    return res.scalars().first()
