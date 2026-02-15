from typing import List
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.core.database import get_db
from app.models.booking import Booking, BookingSource, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreatePublic, BookingResponse

router = APIRouter()


@router.post(
    "/public/booking/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_public_booking(
    booking_in: BookingCreatePublic,
    background_task: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Публичный эндпоинт для создания заявки с сайт.
    Автоматически создает пользователя если он не найден по номеру телефона"""

    result = await db.execute(
        select(User).where(User.phone == booking_in.customer_phone)
    )
    user = result.scalars().first()

    if not user:
        email = (
            booking_in.customer_email or f"{booking_in.customer_phone}@placeholder.com"
        )

        user = User(
            phone=booking_in.customer_phone,
            email=email,
            account_type=UserRole.CUSTOMER,
            first_name=booking_in.customer_name,
            hashed_password="",
        )
        db.add(user)
        await db.flush()
    else:
        if booking_in.customer_email:
            email_check = await db.execute(
                select(User).where(User.email == booking_in.customer_email)
            )
            existing_user = email_check.scalars().first()
            if not existing_user or existing_user.id == user.id:
                user.email = booking_in.customer_email
        user.first_name = booking_in.customer_name
        db.add(user)
        await db.flush()

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

    return booking


@router.get("/", response_model=List[BookingResponse])
async def read_bookings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Получить список всех заявок (Только для администраторов)"""
    query = select(Booking).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
