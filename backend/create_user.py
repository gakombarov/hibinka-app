import asyncio
import logging
from getpass import getpass
import bcrypt

# Исправление ошибки совместимости passlib и bcrypt 4.1.0+
if not hasattr(bcrypt, "__about__"):

    class About:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = About()

from app.database import AsyncSessionLocal, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_manual_user():
    print("--- Создание Администратора ---")
    email = input("Введите Email: ").strip()
    password = getpass("Введите пароль: ").strip()
    full_name = input("ФИО: ").strip()
    phone = input("Телефон (например +7999...): ").strip()

    async with AsyncSessionLocal() as db:

        hashed_pwd = await get_password_hash(password)

        fio_parts = full_name.split()
        last_name = fio_parts[0] if len(fio_parts) > 0 else ""
        first_name = fio_parts[1] if len(fio_parts) > 1 else ""

        print(f"\n--- Проверка данных ---")
        print(f"Email (raw): {email!r}")
        print(f"ФИО: {last_name} {first_name}")

        if input("Данные верны? (y/n): ").strip().lower() != "y":
            print("Отмена операции.")
            return

        new_user = User(
            email=email,
            hashed_password=hashed_pwd,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            account_type=UserRole.ADMIN,
            is_superuser=True,
            is_active=True,
        )

        db.add(new_user)
        await db.commit()
        logger.info(f"Администратор {email} успешно создан!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_manual_user())
