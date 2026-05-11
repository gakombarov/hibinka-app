from datetime import date, timedelta

DAYS_MAP = {"пн": 0, "вт": 1, "ср": 2, "чт": 3, "пт": 4, "сб": 5, "вс": 6}


def calculate_contract_unit_price(
    start_date: date, end_date: date, days_of_week: str, total_value: int
) -> int:
    """
    Рассчитывает стоимость одной поездки (unit price) на основе общей суммы контракта.
    Делит общую сумму на количество фактических дней поездок в периоде.
    """
    if not all([start_date, end_date, days_of_week, total_value]):
        return 0

    active_days = [
        DAYS_MAP[d.strip().lower()]
        for d in days_of_week.split(",")
        if d.strip().lower() in DAYS_MAP
    ]

    if not active_days:
        return 0

    total_trips = 0
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() in active_days:
            total_trips += 1
        current_date += timedelta(days=1)

    if total_trips == 0:
        return total_value

    return total_value // total_trips
