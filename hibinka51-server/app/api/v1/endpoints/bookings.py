from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import joinedload, selectinload

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import (
    BookingCreatePublic,
    BookingResponse,
    BookingUpdate,
    BookingConfirm,
    BookingCreateAdmin,
)
from app.models.trip import Trip, TripStatus, PaymentStatus
from app.schemas.trip import TripResponse

router = APIRouter()


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: UUID,
    booking_in: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .where(Booking.id == booking_id)
    )
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    update_data = booking_in.model_dump(exclude_unset=True)

    if update_data.get("status") == BookingStatus.CANCELLED:
        for t in booking.trips:
            if t.status != TripStatus.COMPLETED:
                t.status = TripStatus.CANCELLED
                db.add(t)

    for field, value in update_data.items():
        setattr(booking, field, value)

    db.add(booking)
    await db.commit()

    res = await db.execute(query)
    return res.scalars().first()


@router.post(
    "/public/booking",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_public_booking(
    booking_in: BookingCreatePublic,
    db: AsyncSession = Depends(get_db),
):
    """Создание заявки клиентом с публичного сайта"""
    conditions = [User.phone == booking_in.customer_phone]
    if booking_in.customer_email:
        conditions.append(User.email == booking_in.customer_email)

    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalars().first()
    if not user:
        email_val = (
            booking_in.customer_email
            or f"user_{booking_in.customer_phone}@hibinka.local"
        )

        user = User(
            phone=booking_in.customer_phone,
            email=email_val,
            account_type=UserRole.CUSTOMER,
            first_name=booking_in.customer_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()
    else:
        user.first_name = booking_in.customer_name

        if booking_in.customer_email and "@hibinka.local" in user.email:
            user.email = booking_in.customer_email

        db.add(user)

    booking = Booking(
        customer_id=user.id,
        source=BookingSource.WEBSITE,
        status=BookingStatus.NEW,
        desired_trip_date=booking_in.desired_trip_date,
        desired_departure_time=booking_in.desired_departure_time,
        desired_trip_location=booking_in.desired_trip_location,
        arrival_location=booking_in.arrival_location,
        passenger_count=booking_in.passenger_count,
        luggage_description=booking_in.luggage_description,
        notes=booking_in.notes,
    )

    db.add(booking)
    await db.commit()

    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .where(Booking.id == booking.id)
    )
    result = await db.execute(query)
    full_booking = result.scalars().first()

    return full_booking


@router.get("/", response_model=List[BookingResponse])
async def read_bookings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Получить список всех заявок (Только для администраторов)"""
    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{booking_id}/confirm", response_model=BookingResponse)
async def convert_booking_to_trip(
    booking_id: UUID, confirm_data: BookingConfirm, db: AsyncSession = Depends(get_db)
):

    query = select(Booking).where(Booking.id == booking_id)
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking or booking.status == BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Ошибка подтверждения")

    booking.status = BookingStatus.CONFIRMED
    booking.total_amount = confirm_data.total_amount
    booking.paid_amount = confirm_data.paid_amount

    db.add(
        Trip(
            booking_id=booking.id,
            customer_id=booking.customer_id,
            trip_date=booking.desired_trip_date,
            departure_time=booking.desired_departure_time,
            departure_location=booking.desired_trip_location,
            arrival_location=booking.arrival_location,
            passenger_count=booking.passenger_count,
            status=TripStatus.PLANNED,
            has_trailer=confirm_data.has_trailer,
            notes=confirm_data.notes,
        )
    )

    if booking.is_round_trip and booking.return_date:
        db.add(
            Trip(
                booking_id=booking.id,
                customer_id=booking.customer_id,
                trip_date=booking.return_date,
                departure_time=booking.return_time or booking.desired_departure_time,
                departure_location=booking.arrival_location,
                arrival_location=booking.desired_trip_location,
                passenger_count=booking.passenger_count,
                status=TripStatus.PLANNED,
                has_trailer=confirm_data.has_trailer,
                notes=confirm_data.notes,
            )
        )

    await db.commit()

    final_query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .where(Booking.id == booking_id)
    )
    res = await db.execute(final_query)
    return res.scalars().first()


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_admin_booking(
    booking_in: BookingCreateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Создание заявки диспетчером вручную (по телефону/в мессенджере)"""

    conditions = [User.phone == booking_in.customer_phone]
    if booking_in.customer_email:
        conditions.append(User.email == booking_in.customer_email)

    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalars().first()

    if not user:
        email_val = (
            booking_in.customer_email
            or f"user_{booking_in.customer_phone}@hibinka.local"
        )
        user = User(
            phone=booking_in.customer_phone,
            email=email_val,
            account_type=UserRole.CUSTOMER,
            first_name=booking_in.customer_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()
    else:
        user.first_name = booking_in.customer_name
        if booking_in.customer_email and "@hibinka.local" in user.email:
            user.email = booking_in.customer_email
        db.add(user)

    booking = Booking(
        customer_id=user.id,
        source=booking_in.source or BookingSource.PHONE,
        status=BookingStatus.NEW,
        desired_trip_date=booking_in.desired_trip_date,
        desired_departure_time=booking_in.desired_departure_time,
        desired_trip_location=booking_in.desired_trip_location,
        arrival_location=booking_in.arrival_location,
        passenger_count=booking_in.passenger_count,
        luggage_description=booking_in.luggage_description,
        notes=booking_in.notes,
        is_round_trip=booking_in.is_round_trip,
        return_date=booking_in.return_date,
        return_time=booking_in.return_time,
        total_amount=booking_in.total_amount,
        paid_amount=booking_in.paid_amount,
    )

    db.add(booking)
    await db.commit()

    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .where(Booking.id == booking.id)
    )
    result = await db.execute(query)
    full_booking = result.scalars().first()

    return full_booking


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_by_id(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Получить детали одной заявки со всеми вложенными рейсами."""
    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).selectinload(Trip.stops),
        )
        .where(Booking.id == booking_id)
    )
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    return booking
