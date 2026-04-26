from typing import List
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.trip import Trip, TripStatus, PaymentStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreatePublic, BookingResponse, BookingUpdate, BookingConfirm
from app.schemas.trip import TripResponse
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

router = APIRouter()


@router.get("/", response_model=List[BookingResponse])
async def read_bookings(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),
):
    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).options(
                selectinload(Trip.stops),
                joinedload(Trip.customer),
                joinedload(Trip.booking)
            )
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().unique().all()


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
            selectinload(Booking.trips).options(
                selectinload(Trip.stops),
                joinedload(Trip.customer),
                joinedload(Trip.booking)
            )
        )
        .where(Booking.id == booking_id)
    )
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    update_data = booking_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(booking, field, value)

    if "total_amount" in update_data or "paid_amount" in update_data:
        for trip in booking.trips:
            if "total_amount" in update_data:
                trip.total_amount = booking.total_amount
            if "paid_amount" in update_data:
                trip.paid_amount = booking.paid_amount

            if trip.total_amount and trip.paid_amount >= trip.total_amount:
                trip.payment_status = PaymentStatus.PAID
            else:
                trip.payment_status = PaymentStatus.PENDING

            db.add(trip)

    db.add(booking)
    await db.commit()

    result = await db.execute(query.execution_options(populate_existing=True))
    return result.scalars().first()


@router.post("/public/booking", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_public_booking(
        booking_in: BookingCreatePublic,
        db: AsyncSession = Depends(get_db),
):
    conditions = [User.phone == booking_in.customer_phone]
    if booking_in.customer_email:
        conditions.append(User.email == booking_in.customer_email)

    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalars().first()

    if not user:
        email_val = booking_in.customer_email or f"user_{booking_in.customer_phone}@hibinka.local"
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
            selectinload(Booking.trips).options(
                selectinload(Trip.stops),
                joinedload(Trip.customer),
                joinedload(Trip.booking)
            )
        )
        .where(Booking.id == booking.id)
    )
    res = await db.execute(query)
    return res.scalars().first()


@router.post("/{booking_id}/confirm", response_model=TripResponse)
async def convert_booking_to_trip(
        booking_id: UUID, confirm_data: BookingConfirm, db: AsyncSession = Depends(get_db)
):
    query = select(Booking).where(Booking.id == booking_id)
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if booking.status == BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Уже в журнале")

    new_trip = Trip(
        customer_id=booking.customer_id,
        booking_id=booking.id,
        trip_date=booking.desired_trip_date,
        departure_time=booking.desired_departure_time,
        departure_location=booking.desired_trip_location,
        arrival_location=booking.arrival_location,
        passenger_count=booking.passenger_count,
        notes=booking.notes,
        total_amount=confirm_data.total_amount,
        paid_amount=confirm_data.paid_amount,
        status=TripStatus.PLANNED,
        payment_status=PaymentStatus.PAID if confirm_data.paid_amount >= confirm_data.total_amount else PaymentStatus.PENDING,
        is_regular=False,
    )
    db.add(new_trip)

    booking.status = BookingStatus.CONFIRMED
    booking.total_amount = confirm_data.total_amount
    booking.paid_amount = confirm_data.paid_amount
    await db.commit()

    stmt = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking).joinedload(Booking.customer),
            joinedload(Trip.customer)
        )
        .where(Trip.id == new_trip.id)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
        booking_id: UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(deps.get_current_admin_user),
):
    """Получить детали одной конкретной заявки"""
    query = (
        select(Booking)
        .options(
            joinedload(Booking.customer),
            selectinload(Booking.trips).options(
                selectinload(Trip.stops),
                joinedload(Trip.customer),
                joinedload(Trip.booking)
            )
        )
        .where(Booking.id == booking_id)
    )
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    return booking


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
        booking_in: BookingCreatePublic,
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.phone == booking_in.customer_phone))
    user = result.scalars().first()

    if not user:
        user = User(
            phone=booking_in.customer_phone,
            email=booking_in.customer_email or f"user_{booking_in.customer_phone}@hibinka.local",
            account_type=UserRole.CUSTOMER,
            first_name=booking_in.customer_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()


    input_data = booking_in.model_dump()
    source_val = input_data.get("source", BookingSource.WEBSITE)

    booking = Booking(
        customer_id=user.id,
        source=source_val,
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
        .options(joinedload(Booking.customer), selectinload(Booking.trips))
        .where(Booking.id == booking.id)
    )
    res = await db.execute(query)
    return res.scalars().first()
