from datetime import date, timedelta
from typing import List

from app.schemas.scheduled_trip import ScheduledTripCycleCreate

DAYS_MAP = {"пн": 0, "вт": 1, "ср": 2, "чт": 3, "пт": 4, "сб": 5, "вс": 6}


def calculate_contract_unit_price(
    start_date: date,
    end_date: date,
    total_value: int,
    cycles: List[ScheduledTripCycleCreate],
) -> int:
    """
    Считает стоимость одного полного цикла (рейса) на основе графиков и календаря.
    """
    if not all([start_date, end_date, total_value, cycles]):
        return 0

    total_cycles_count = 0
    current_date = start_date

    while current_date <= end_date:
        weekday = current_date.weekday()

        for cycle in cycles:
            active_days = [
                DAYS_MAP[d.strip().lower()]
                for d in cycle.days_of_week.split(",")
                if d.strip().lower() in DAYS_MAP
            ]

            if weekday in active_days:
                total_cycles_count += 1

        current_date += timedelta(days=1)

    if total_cycles_count == 0:
        return 0

    return total_value // total_cycles_count
