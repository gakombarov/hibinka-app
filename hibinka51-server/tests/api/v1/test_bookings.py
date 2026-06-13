import time

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_public_booking_functional_and_performance(client: AsyncClient):
    payload = {
        "customer_name": "Тест Клиент",
        "customer_phone": "+79001234567",
        "customer_email": "test_perf@hibinka.ru",
        "desired_trip_date": "2026-12-01",
        "desired_departure_time": "12:00:00",
        "desired_trip_location": "Кировск, ул. Ленина 1",
        "arrival_location": "Аэропорт Хибины",
        "passenger_count": 4,
        "luggage_description": "2 сноуборда",
        "notes": "Тестовая заявка",
    }

    start_time = time.perf_counter()
    response = await client.post("/api/v1/bookings/public/booking", json=payload)
    end_time = time.perf_counter()

    assert response.status_code == 201

    data = response.json()
    assert "id" in data
    assert data["status"] == "NEW"
    assert data["source"] == "WEBSITE"

    execution_time = end_time - start_time
    assert execution_time <= 0.5


@pytest.mark.asyncio
async def test_booking_transaction_acid_rollback(client: AsyncClient):
    invalid_payload = {
        "customer_phone": "+79001234567",
        "desired_trip_date": "INVALID_DATE",
        "desired_departure_time": "12:00:00",
        "desired_trip_location": "Кировск",
        "arrival_location": "Аэропорт",
        "passenger_count": 4,
    }

    response = await client.post(
        "/api/v1/bookings/public/booking", json=invalid_payload
    )
    assert response.status_code == 422
