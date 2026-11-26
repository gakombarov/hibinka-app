import pytest


@pytest.mark.parametrize("field,value", [
    ("status", "IN_PROGRESS"),
    ("passenger_count", 7),
    ("has_trailer", True),
    ("notes", "Обратное направление"),
])
async def test_journal_direction_changes_survive_reload(client, mock_trip_large, field, value):
    response = await client.patch(
        f"/api/v1/trips/{mock_trip_large.id}", json={field: value}
    )
    assert response.status_code == 200
    assert response.json()[field] == value

    journal = await client.get("/api/v1/trips/")
    assert journal.status_code == 200
    saved = next(trip for trip in journal.json() if trip["id"] == str(mock_trip_large.id))
    assert saved[field] == value


async def test_round_trip_booking_metadata_is_available_in_journal(client):
    payload = {
        "customer_name": "Тестовый клиент", "customer_phone": "+79001234567", "source": "PHONE",
        "desired_trip_date": "2026-12-01", "desired_departure_time": "08:00:00",
        "desired_trip_location": "а/п Хибины", "arrival_location": "Мончегорск",
        "passenger_count": 4, "is_round_trip": True,
        "return_date": "2026-12-01", "return_time": "10:00:00",
    }
    created = await client.post("/api/v1/bookings/", json=payload)
    assert created.status_code == 201
    confirmed = await client.post(
        f"/api/v1/bookings/{created.json()['id']}/confirm",
        json={"total_amount": 3000, "paid_amount": 1000, "has_trailer": False},
    )
    assert confirmed.status_code == 200
    response = await client.get("/api/v1/trips/")
    assert response.status_code == 200
    trips = response.json()
    assert len(trips) == 2
    for trip in trips:
        assert trip["booking"]["is_round_trip"] is True
        assert trip["booking"]["desired_departure_time"] == "08:00:00"
        assert trip["booking"]["return_time"] == "10:00:00"
        assert trip["booking"]["total_amount"] == 3000
