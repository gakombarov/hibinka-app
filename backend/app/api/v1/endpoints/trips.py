from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from uuid import UUID

from app.api.deps import get_db
from app.models.trip import Trip, TripStop
from app.schemas.trip import TripCreate, TripResponse, TripDriverUpdate, TripUpdate

router = APIRouter()


@router.get("/landing", response_model=List[TripResponse])
def get_trips_for_landing(
    target_date: date = Query(
        default_factory=date.today, description="Дата для поиска рейсов"
    ),
    db: Session = Depends(get_db),
):
    """
    Получить расписание регулярных рейсов для ЛЭНДИНГА на определенную дату.
    """
    trips = (
        db.query(Trip)
        .filter(
            Trip.is_regular == True,
            Trip.trip_date == target_date,
            Trip.is_deleted == False,
        )
        .order_by(Trip.departure_time)
        .all()
    )

    return trips


@router.patch("/{trip_id}/status", response_model=TripResponse)
def update_trip_status(
    trip_id: UUID, status_update: TripDriverUpdate, db: Session = Depends(get_db)
):
    """
    Эндпоинт для ВОДИТЕЛЯ.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.is_deleted == False).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    trip.status = status_update.status
    db.commit()
    db.refresh(trip)

    return trip


@router.post("/", response_model=TripResponse)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db)):
    """
    Создание новой поездки в Журнале .
    """
    trip_data = trip_in.model_dump(exclude={"stops"})
    db_trip = Trip(**trip_data)
    db.add(db_trip)
    db.flush()

    for stop_in in trip_in.stops:
        db_stop = TripStop(
            trip_id=db_trip.id, location=stop_in.location, stop_order=stop_in.stop_order
        )
        db.add(db_stop)

    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[TripResponse])
def get_all_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Просмотр всего Журнала (для вывода таблицы в Дашборде).
    """
    trips = (
        db.query(Trip).filter(Trip.is_deleted == False).offset(skip).limit(limit).all()
    )
    return trips


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: UUID, trip_in: TripUpdate, db: Session = Depends(get_db)):
    """
    Редактирование поездки.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.is_deleted == False).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")

    update_data = trip_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != "stops":
            setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip
