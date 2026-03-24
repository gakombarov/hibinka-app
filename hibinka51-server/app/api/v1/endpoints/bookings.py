from typing import List
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreatePublic, BookingResponse

router = APIRouter()


@router.post(
    "/public/booking",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
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

    await db.refresh(booking)
    await db.refresh(user)

    booking.customer = user

    return booking


@router.get("/", response_model=List[BookingResponse])
async def read_bookings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Получить список всех заявок (Только для администраторов)"""
    query = (
        select(Booking).options(joinedload(Booking.customer)).offset(skip).limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()
