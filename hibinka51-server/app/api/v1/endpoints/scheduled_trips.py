from typing import List
from uuid import UUID

from app.api import deps
from app.core.database import get_db
from app.models.scheduled_trip import ScheduledTrip, ScheduledTripStop
from app.models.user import User
from app.schemas.scheduled_trip import (
    ScheduledTripCreate,
    ScheduledTripResponse,
    ScheduledTripUpdate,
)
from app.services.scheduled_trip_service import calculate_contract_unit_price

# ВОТ НАШ НОВЫЙ ИМПОРТ ВМЕСТО CELERY
from app.services.scheduler_tasks import run_trip_generation_task
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

router = APIRouter()


@router.get("/", response_model=List[ScheduledTripResponse])
async def get_all_scheduled_trips(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    query = select(ScheduledTrip).options(selectinload(ScheduledTrip.stops))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/public/", response_model=List[ScheduledTripResponse])
async def get_public_scheduled_trips(db: AsyncSession = Depends(get_db)):
    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.is_active == True)
        .where(ScheduledTrip.show_on_landing == True)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{trip_id}", response_model=ScheduledTripResponse)
async def get_scheduled_trip_by_id(
    trip_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.id == trip_id)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(query)
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Not found")
    return trip


@router.post("/", response_model=ScheduledTripResponse)
async def create_scheduled_trip(
    obj_in: ScheduledTripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    create_data = obj_in.model_dump(exclude={"stops"})

    if (
        obj_in.total_contract_value
        and obj_in.contract_start_date
        and obj_in.contract_end_date
    ):
        calculated_price = calculate_contract_unit_price(
            start_date=obj_in.contract_start_date,
            end_date=obj_in.contract_end_date,
            days_of_week=obj_in.days_of_week,
            total_value=obj_in.total_contract_value,
        )
        create_data["price"] = calculated_price

    new_trip = ScheduledTrip(**create_data)
    db.add(new_trip)
    await db.flush()

    if obj_in.stops:
        for stop_data in obj_in.stops:
            new_stop = ScheduledTripStop(**stop_data.model_dump(), trip_id=new_trip.id)
            db.add(new_stop)

    await db.commit()

    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.id == new_trip.id)
        .options(selectinload(ScheduledTrip.stops))
    )
    res = await db.execute(query)
    return res.scalars().first()


@router.patch("/{trip_id}", response_model=ScheduledTripResponse)
async def update_scheduled_trip(
    trip_id: UUID,
    obj_in: ScheduledTripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.id == trip_id)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(query)
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Not found")

    update_data = obj_in.model_dump(exclude_unset=True, exclude={"stops"})

    start_date = update_data.get("contract_start_date", trip.contract_start_date)
    end_date = update_data.get("contract_end_date", trip.contract_end_date)
    total_val = update_data.get("total_contract_value", trip.total_contract_value)
    days = update_data.get("days_of_week", trip.days_of_week)

    if total_val and start_date and end_date:
        calculated_price = calculate_contract_unit_price(
            start_date=start_date,
            end_date=end_date,
            days_of_week=days,
            total_value=total_val,
        )
        update_data["price"] = calculated_price

    for field, value in update_data.items():
        setattr(trip, field, value)

    if obj_in.stops is not None:
        await db.execute(
            delete(ScheduledTripStop).where(ScheduledTripStop.trip_id == trip_id)
        )
        for stop_data in obj_in.stops:
            new_stop = ScheduledTripStop(**stop_data.model_dump(), trip_id=trip.id)
            db.add(new_stop)

    await db.commit()

    final_query = (
        select(ScheduledTrip)
        .where(ScheduledTrip.id == trip_id)
        .options(selectinload(ScheduledTrip.stops))
    )
    final_res = await db.execute(final_query)
    return final_res.scalars().first()


@router.post("/sync")
async def trigger_sync(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_admin_user),
):
    background_tasks.add_task(run_trip_generation_task)
