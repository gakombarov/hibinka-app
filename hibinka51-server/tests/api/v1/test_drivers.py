import uuid
from datetime import date, time

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.driver import DriverProfile
from app.models.trip import Trip, TripStatus, PaymentStatus
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleCategory


DRIVER_PAYLOAD = {
    "first_name": "Иван",
    "last_name": "Петров",
    "call_sign": "Спринтер 55",
    "phone": "+79001234567",
    "is_external": False,
}


@pytest.mark.asyncio
async def test_create_driver_success(client: AsyncClient, db_session: AsyncSession):
    response = await client.post("/api/v1/drivers/", json=DRIVER_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["call_sign"] == "Спринтер 55"

    driver_uuid = uuid.UUID(data["id"])
    driver_result = await db_session.execute(
        select(DriverProfile).where(DriverProfile.id == driver_uuid)
    )
    driver = driver_result.scalars().first()
    assert driver is not None

    user_uuid = uuid.UUID(str(driver.user_id))
    user_result = await db_session.execute(
        select(User).where(User.id == user_uuid)
    )
    user = user_result.scalars().first()
    assert user is not None
    assert user.account_type == UserRole.DRIVER


@pytest.mark.asyncio
async def test_delete_driver_assigned_to_trip_is_soft_delete(
    client: AsyncClient, db_session: AsyncSession
):
    create_resp = await client.post("/api/v1/drivers/", json=DRIVER_PAYLOAD)
    assert create_resp.status_code == 201
    driver_id = uuid.UUID(create_resp.json()["id"])

    trip = Trip(
        id=uuid.uuid4(),
        driver_id=driver_id,
        trip_date=date(2027, 6, 1),
        departure_time=time(10, 0),
        departure_location="Мурманск",
        arrival_location="Кировск",
        passenger_count=4,
        status=TripStatus.PLANNED,
        payment_status=PaymentStatus.PENDING,
        total_amount=3000,
        paid_amount=0,
    )
    db_session.add(trip)
    await db_session.commit()

    delete_resp = await client.delete(f"/api/v1/drivers/{driver_id}")
    assert delete_resp.status_code == 200

    driver_result = await db_session.execute(
        select(DriverProfile).where(DriverProfile.id == driver_id)
    )
    driver = driver_result.scalars().first()
    assert driver.is_deleted is True

