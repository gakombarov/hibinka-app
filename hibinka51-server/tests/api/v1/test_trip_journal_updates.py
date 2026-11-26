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
