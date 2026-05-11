import logging

from app.core.database import AsyncSessionLocal
from app.services.trip_generator import generate_trips_from_schedule

logger = logging.getLogger(__name__)


async def run_trip_generation_task(days_ahead: int = 14):
    logger.info("Начало фоновой генерации рейсов...")
    try:
        async with AsyncSessionLocal() as db:
            await generate_trips_from_schedule(db, days_ahead)
        logger.info("Фоновая генерация рейсов успешно завершена!")
    except Exception as e:
        logger.error(f"Ошибка при фоновой генерации: {e}")
