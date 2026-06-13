import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_assign_vehicle_capacity_exceeded(
    client: AsyncClient, mock_trip_large, mock_vehicle_small
):
    payload = {"vehicle_id": str(mock_vehicle_small.id), "split_if_needed": False}

    response = await client.patch(
        f"/api/v1/trips/{mock_trip_large.id}/assign-vehicle", json=payload
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "CAPACITY_EXCEEDED"


@pytest.mark.asyncio
async def test_assign_vehicle_split_success(
    client: AsyncClient, mock_trip_large, mock_vehicle_small
):
    payload = {"vehicle_id": str(mock_vehicle_small.id), "split_if_needed": True}

    response = await client.patch(
        f"/api/v1/trips/{mock_trip_large.id}/assign-vehicle", json=payload
    )

    assert response.status_code == 200
    assert response.json()["passenger_count"] == mock_vehicle_small.capacity
    assert response.json()["vehicle_id"] == str(mock_vehicle_small.id)
