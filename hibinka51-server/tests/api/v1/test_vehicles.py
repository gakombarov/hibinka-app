import uuid
import pytest
from httpx import AsyncClient


VEHICLE_PAYLOAD = {
    "alias": "Спринтер 101",
    "brand": "Mercedes-Benz",
    "model": "Sprinter",
    "license_plate": "В222ВВ51",
    "capacity": 12,
    "category": "MINIBUS",
    "is_active": True,
}


@pytest.mark.asyncio
async def test_create_vehicle_success(client: AsyncClient):
    response = await client.post("/api/v1/vehicles/", json=VEHICLE_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["capacity"] == 12
    assert data["license_plate"] == "В222ВВ51"


@pytest.mark.asyncio
async def test_create_vehicle_duplicate_license_plate(client: AsyncClient):
    await client.post("/api/v1/vehicles/", json=VEHICLE_PAYLOAD)
    response = await client.post("/api/v1/vehicles/", json=VEHICLE_PAYLOAD)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_toggle_active(client: AsyncClient):
    create_resp = await client.post("/api/v1/vehicles/", json=VEHICLE_PAYLOAD)
    assert create_resp.status_code == 201
    vehicle_id = create_resp.json()["id"]
    original_active = create_resp.json()["is_active"]

    toggle_resp = await client.patch(f"/api/v1/vehicles/{vehicle_id}/toggle-active")
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["is_active"] == (not original_active)

    toggle_resp2 = await client.patch(f"/api/v1/vehicles/{vehicle_id}/toggle-active")
    assert toggle_resp2.status_code == 200
    assert toggle_resp2.json()["is_active"] == original_active
