import asyncio
import logging
from getpass import getpass

from app.database import AsyncSessionLocal
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

        new_user = User(
            email=email,
            hashed_password=hashed_pwd,
            full_name=full_name,
            phone=phone,
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(new_user)
        await db.commit()
        logger.info(f"Администратор {email} успешно создан!")


if __name__ == "__main__":
    asyncio.run(create_manual_user())
