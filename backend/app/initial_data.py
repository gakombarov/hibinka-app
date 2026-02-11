import asyncio
import logging
from sqlalchemy import select

from app.database import engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_tables():
    """
    Создает таблицы в базе данных.
    В продакшене лучше использовать Alembic (миграции),
    но для старта разработки это самый быстрый способ.
    """
    logger.info("Создание таблиц в БД...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Таблицы успешно созданы.")


async def create_first_admin():
    """
    Создает первого пользователя-администратора (Диспетчера).
    """
    async with AsyncSessionLocal() as db:
        admin_email = "admin@hibinka.ru"

        logger.info(f"Проверка наличия пользователя {admin_email}...")

        stmt = select(User).where(User.email == admin_email)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            logger.info("Администратор не найден. Создаем...")

            hashed_pwd = await get_password_hash("admin")

            new_admin = User(
                email=admin_email,
                hashed_password=hashed_pwd,
                full_name="Главный Диспетчер",
                phone="+79990000000",
                role=UserRole.ADMIN,
                is_active=True,
            )

            db.add(new_admin)
            await db.commit()
            logger.info(f"Администратор создан! Логин: {admin_email}, Пароль: admin")
        else:
            logger.info("Администратор уже существует.")


async def main():
    await create_tables()
    await create_first_admin()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
