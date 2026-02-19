from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import date
from uuid import UUID

from app.api.deps import get_db
from app.models.trip import Trip, TripStop
from app.schemas.trip import TripCreate, TripResponse, TripDriverUpdate, TripUpdate

router = APIRouter()


@router.get("/landing", response_model=List[TripResponse])
async def get_trips_for_landing(
    target_date: date = Query(
        default_factory=date.today, description="Дата для поиска рейсов"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить расписание регулярных рейсов для ЛЭНДИНГА на определенную дату.
    """
    query = (
        select(Trip)
        .where(
            Trip.is_regular == True,
            Trip.trip_date == target_date,
            Trip.is_deleted == False,
        )
        .order_by(Trip.departure_time)
    )
    
    result = await db.execute(query)
    
    return result.scalars().all()


@router.patch("/{trip_id}/status", response_model=TripResponse)
async def update_trip_status(
    trip_id: UUID, 
    status_update: TripDriverUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт для ВОДИТЕЛЯ.
    """
    query = select(Trip).where(Trip.id == trip_id, Trip.is_deleted == False)
    result = await db.execute(query)
    trip = result.scalars().first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    trip.status = status_update.status
    
    await db.commit()
    await db.refresh(trip)

    return trip


@router.post("/", response_model=TripResponse)
async def create_trip(
    trip_in: TripCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Создание новой поездки в Журнале.
    """
    trip_data = trip_in.model_dump(exclude={"stops"})
    db_trip = Trip(**trip_data)
    db.add(db_trip)
    await db.flush()

    for stop_in in trip_in.stops:
        db_stop = TripStop(
            trip_id=db_trip.id, 
            location=stop_in.location, 
            stop_order=stop_in.stop_order
        )
        db.add(db_stop)

    await db.commit()
    await db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[TripResponse])
async def get_all_trips(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """
    Просмотр всего Журнала (для вывода таблицы в Дашборде).
    """
    query = select(Trip).where(Trip.is_deleted == False).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: UUID, 
    trip_in: TripUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Редактирование поездки.
    """
    query = select(Trip).where(Trip.id == trip_id, Trip.is_deleted == False)
    result = await db.execute(query)
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    update_data = trip_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != "stops":
            setattr(trip, field, value)

    await db.commit()
    await db.refresh(trip)
    return trip
