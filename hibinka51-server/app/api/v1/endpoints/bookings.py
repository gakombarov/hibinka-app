from typing import List
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.trip import PaymentStatus, Trip, TripStatus
from app.models.user import User, UserRole
from app.schemas.booking import (
    BookingConfirm,
    BookingCreateAdmin,
    BookingCreatePublic,
    BookingResponse,
    BookingUpdate,
)
from app.schemas.trip import TripResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
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
                joinedload(Trip.booking),
            ),
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
                joinedload(Trip.booking),
            ),
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


@router.post(
    "/public/booking",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_public_booking(
    booking_in: BookingCreatePublic,
    db: AsyncSession = Depends(get_db),
):
    """Эндпоинт для Лендинга: здесь телефон обязателен"""
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

    input_data = booking_in.model_dump()

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
        has_trailer=input_data.get("has_trailer", False),
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
                joinedload(Trip.booking),
            ),
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

    confirm_dict = confirm_data.model_dump()
    needs_trailer = confirm_dict.get(
        "has_trailer", getattr(booking, "has_trailer", False)
    )

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
        payment_status=PaymentStatus.PAID
        if confirm_data.paid_amount >= confirm_data.total_amount
        else PaymentStatus.PENDING,
        is_regular=False,
        has_trailer=needs_trailer,
    )
    db.add(new_trip)

    if booking.is_round_trip and booking.return_date and booking.return_time:
        return_trip = Trip(
            customer_id=booking.customer_id,
            booking_id=booking.id,
            trip_date=booking.return_date,
            departure_time=booking.return_time,
            departure_location=booking.arrival_location,
            arrival_location=booking.desired_trip_location,
            passenger_count=booking.passenger_count,
            notes=f"Обратный рейс (от заявки). {booking.notes or ''}",
            total_amount=0,
            paid_amount=0,
            status=TripStatus.PLANNED,
            payment_status=PaymentStatus.PENDING,
            is_regular=False,
            has_trailer=needs_trailer,
        )
        db.add(return_trip)

    booking.status = BookingStatus.CONFIRMED
    booking.total_amount = confirm_data.total_amount
    booking.paid_amount = confirm_data.paid_amount
    if hasattr(booking, "has_trailer"):
        booking.has_trailer = needs_trailer

    await db.commit()

    stmt = (
        select(Trip)
        .options(
            selectinload(Trip.stops),
            joinedload(Trip.booking).joinedload(Booking.customer),
            joinedload(Trip.customer),
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
                joinedload(Trip.booking),
            ),
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
    booking_in: BookingCreateAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Эндпоинт для Диспетчера: телефон НЕОБЯЗАТЕЛЕН"""
    user = None

    if booking_in.customer_phone:
        result = await db.execute(
            select(User).where(User.phone == booking_in.customer_phone)
        )
        user = result.scalars().first()

    if not user:
        import uuid

        random_id = str(uuid.uuid4())[:8]
        email_val = booking_in.customer_email or f"manual_{random_id}@hibinka.local"

        user = User(
            phone=booking_in.customer_phone,
            email=email_val,
            account_type=UserRole.CUSTOMER,
            first_name=booking_in.customer_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()

    input_data = booking_in.model_dump()
    source_val = input_data.get("source", BookingSource.PHONE)

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
        total_amount=booking_in.total_amount,
        paid_amount=booking_in.paid_amount,
        is_round_trip=booking_in.is_round_trip,
        return_date=booking_in.return_date,
        return_time=booking_in.return_time,
        has_trailer=input_data.get("has_trailer", False),
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
