from datetime import date, timedelta

from app.models.scheduled_trip import ScheduledTrip
from app.models.trip import Trip, TripStop
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

DAYS_MAP = {"пн": 0, "вт": 1, "ср": 2, "чт": 3, "пт": 4, "сб": 5, "вс": 6}


def parse_days(days_str: str) -> list[int]:
    if not days_str:
        return []
    return [
        DAYS_MAP[d.strip().lower()]
        for d in days_str.split(",")
        if d.strip().lower() in DAYS_MAP
    ]


async def generate_trips_from_schedule(db: AsyncSession, days_ahead: int = 14):
    today = date.today()
    max_date = today + timedelta(days=days_ahead)

    stmt = (
        select(ScheduledTrip)
        .where(ScheduledTrip.is_active == True)
        .options(selectinload(ScheduledTrip.stops))
    )
    result = await db.execute(stmt)
    schedules = result.scalars().all()

    for schedule in schedules:
        active_days = parse_days(schedule.days_of_week)

        end_date = max_date
        if schedule.contract_end_date:
            end_date = min(max_date, schedule.contract_end_date)

        current_date = today
        while current_date <= end_date:
            if current_date.weekday() in active_days:
                exists_stmt = select(Trip).where(
                    Trip.scheduled_trip_id == schedule.id,
                    Trip.trip_date == current_date,
                )
                exists_result = await db.execute(exists_stmt)
                exists = exists_result.scalars().first()

                if not exists:
                    new_trip = Trip(
                        scheduled_trip_id=schedule.id,
                        trip_date=current_date,
                        departure_time=schedule.departure_time,
                        departure_location=schedule.departure_location,
                        arrival_location=schedule.destination,
                        passenger_count=0,
                        is_regular=True,
                        show_on_landing=schedule.show_on_landing,
                        status="PLANNED",
                        total_amount=schedule.price,
                    )
                    db.add(new_trip)
                    await db.flush()

                    for s_stop in schedule.stops:
                        db.add(
                            TripStop(
                                trip_id=new_trip.id,
                                location=s_stop.location,
                                stop_order=s_stop.stop_order,
                            )
                        )
            current_date += timedelta(days=1)

    await db.commit()
