from typing import List
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking
from app.models.trip import Trip, PaymentStatus
from app.models.user import User
from app.schemas.trip import TripResponse, TripUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

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
    trips = result.scalars().all()

    for trip in trips:
        if trip.booking:
            trip.total_amount = trip.booking.total_amount
            trip.paid_amount = trip.booking.paid_amount

    return trips


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
            update_data["paid_amount"] = update_data.get("total_amount", trip.total_amount)
        elif update_data["payment_status"] == PaymentStatus.PENDING and "paid_amount" not in update_data:
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

            siblings_stmt = select(Trip).where(Trip.booking_id == trip.booking_id, Trip.id != trip.id)
            siblings = await db.execute(siblings_stmt)
            for s in siblings.scalars().all():
                s.total_amount = trip.total_amount
                s.paid_amount = trip.paid_amount
                db.add(s)

            db.add(trip.booking)

    await db.commit()
    res = await db.execute(query)
    return res.scalars().first()
