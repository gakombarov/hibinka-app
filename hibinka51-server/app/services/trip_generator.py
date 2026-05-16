import uuid
from datetime import date, timedelta

from app.models.scheduled_trip import ScheduledTrip
from app.models.trip import Trip, TripStop
from sqlalchemy import delete, select
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
    limit_date = today + timedelta(days=days_ahead)

    stmt = (
        select(ScheduledTrip)
        .where(ScheduledTrip.is_active == True)
        .options(selectinload(ScheduledTrip.stops), selectinload(ScheduledTrip.cycles))
    )
    result = await db.execute(stmt)
    schedules = result.scalars().all()

    for schedule in schedules:
        await db.execute(
            delete(Trip).where(
                Trip.scheduled_trip_id == schedule.id,
                Trip.status == "PLANNED",
                Trip.trip_date >= today,
                Trip.trip_date <= limit_date,
            )
        )

        price_per_leg = schedule.price // 2 if schedule.price else 0

        current_date = max(schedule.contract_start_date, today)
        end_generation_date = min(schedule.contract_end_date, limit_date)

        while current_date <= end_generation_date:
            weekday = current_date.weekday()

            for cycle in schedule.cycles:
                active_days = parse_days(cycle.days_of_week)

                if weekday in active_days:
                    forward_id = str(uuid.uuid4())
                    db.add(
                        Trip(
                            id=forward_id,
                            scheduled_trip_id=schedule.id,
                            trip_date=current_date,
                            departure_time=cycle.departure_time,
                            departure_location=schedule.departure_location,
                            arrival_location=schedule.destination,
                            passenger_count=0,
                            is_regular=True,
                            show_on_landing=schedule.show_on_landing,
                            status="PLANNED",
                            total_amount=price_per_leg,
                            paid_amount=price_per_leg,
                        )
                    )

                    return_id = str(uuid.uuid4())
                    db.add(
                        Trip(
                            id=return_id,
                            scheduled_trip_id=schedule.id,
                            trip_date=current_date,
                            departure_time=cycle.return_time,
                            departure_location=schedule.destination,
                            arrival_location=schedule.departure_location,
                            passenger_count=0,
                            is_regular=True,
                            show_on_landing=schedule.show_on_landing,
                            status="PLANNED",
                            total_amount=price_per_leg,
                            paid_amount=price_per_leg,
                        )
                    )

                    for s_stop in schedule.stops:
                        db.add(
                            TripStop(
                                trip_id=forward_id,
                                location=s_stop.location,
                                stop_order=s_stop.stop_order,
                                stop_time=s_stop.stop_time,
                            )
                        )

            current_date += timedelta(days=1)

    await db.commit()
