from typing import List
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking
from app.models.trip import PaymentStatus, Trip
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.trip import TripResponse, TripUpdate
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

router = APIRouter()


@router.get("/", response_model=List[TripResponse])
async def get_trips(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    query = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking),
            joinedload(Trip.customer),
        )
        .where(Trip.is_deleted == False)
        .order_by(Trip.trip_date.desc(), Trip.departure_time.asc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    trips_list = result.scalars().all()

    for trip in trips_list:
        if trip.booking:
            trip.total_amount = trip.booking.total_amount
            trip.paid_amount = trip.booking.paid_amount

    return trips_list


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: UUID,
    trip_in: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
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

    if "payment_status" in update_data:
        if update_data["payment_status"] == PaymentStatus.PAID:
            update_data["paid_amount"] = update_data.get(
                "total_amount", trip.total_amount
            )
        elif (
            update_data["payment_status"] == PaymentStatus.PENDING
            and "paid_amount" not in update_data
        ):
            update_data["paid_amount"] = 0

    for field, value in update_data.items():
        if field != "stops":
            setattr(trip, field, value)

    db.add(trip)
    await db.flush()

    if trip.booking_id:
        sync_finance = {"total_amount", "paid_amount", "payment_status"}
        if any(k in update_data for k in sync_finance):
            trip.booking.total_amount = trip.total_amount
            trip.booking.paid_amount = trip.paid_amount

            siblings_stmt = select(Trip).where(
                Trip.booking_id == trip.booking_id, Trip.id != trip.id
            )
            siblings_res = await db.execute(siblings_stmt)
            for s in siblings_res.scalars().all():
                s.total_amount = trip.total_amount
                s.paid_amount = trip.paid_amount
                db.add(s)

            db.add(trip.booking)

    await db.commit()
    res = await db.execute(query)
    return res.scalars().first()


@router.patch("/{trip_id}/assign-vehicle", response_model=TripResponse)
async def assign_vehicle(
    trip_id: UUID,
    vehicle_id: UUID = Body(..., embed=True),
    split_if_needed: bool = Body(False, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    trip_stmt = select(Trip).options(selectinload(Trip.stops)).where(Trip.id == trip_id)
    trip_result = await db.execute(trip_stmt)
    trip = trip_result.scalars().first()

    vehicle_result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = vehicle_result.scalars().first()

    if not trip or not vehicle:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    if vehicle.capacity < trip.passenger_count:
        if not split_if_needed:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "CAPACITY_EXCEEDED",
                    "required": trip.passenger_count,
                    "actual": vehicle.capacity,
                },
            )

        remaining = trip.passenger_count - vehicle.capacity

        new_trip = Trip(
            trip_date=trip.trip_date,
            departure_time=trip.departure_time,
            departure_location=trip.departure_location,
            arrival_location=trip.arrival_location,
            passenger_count=remaining,
            is_regular=trip.is_regular,
            status="PLANNED",
            total_amount=0,
            paid_amount=0,
            payment_status=PaymentStatus.PENDING,
            booking_id=trip.booking_id,
            customer_id=trip.customer_id,
            has_trailer=trip.has_trailer,
            notes=f"Остаток пассажиров от рейса {trip.id}",
        )

        conflict_query = select(Trip).where(
            Trip.vehicle_id == vehicle_id,
            Trip.trip_date == trip.trip_date,
            Trip.departure_time == trip.departure_time,
            Trip.id != trip.id,
            Trip.is_deleted == False,
        )
        conflict_result = await db.execute(conflict_query)
        if conflict_result.scalars().first():
            raise HTTPException(
                status_code=400,
                detail="Эта машина уже назначена на другой рейс в это же время",
            )

        trip.vehicle_id = vehicle.id
        db.add(new_trip)
        trip.passenger_count = vehicle.capacity

    trip.vehicle_id = vehicle.id
    await db.commit()

    final_query = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking),
            joinedload(Trip.customer),
        )
        .where(Trip.id == trip.id)
    )
    final_res = await db.execute(final_query)
    return final_res.scalars().first()
