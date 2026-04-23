from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.core.database import get_db
from app.models.scheduled_trip import ScheduledTrip, ScheduledTripStop
from app.models.user import User
from app.schemas.scheduled_trip import ScheduledTripCreate, ScheduledTripResponse

router = APIRouter()


@router.get("/public/", response_model=List[ScheduledTripResponse])
async def get_public_scheduled_trips(
    db: AsyncSession = Depends(get_db),
):
    """Получить расписания постоянных маршрутов для лэндинга
    Возвращает рейсы постоянных маршрутов"""
    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.is_active)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ScheduledTripResponse)
async def create_scheduled_trip(
    trip_in: ScheduledTripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Добавить новый рейс в расписание
    Принимает данные рейса и список остановок"""

    stops_data = trip_in.stops
    trip_data = trip_in.model_dump(exclude=["stops"])

    trip = ScheduledTrip(**trip_data)
    db.add(trip)
    await db.flush()

    for stop_item in stops_data:
        stop = ScheduledTripStop(trip_id=trip.id, **stop_item.model_dump())
        db.add(stop)

    await db.commit()

    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.id == trip.id)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(query)
    return result.scalars().first()
