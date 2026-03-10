from fastapi import APIRouter
from app.api.v1.endpoints import auth, bookings, users, scheduled_trips, trips

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(
    scheduled_trips.router, prefix="/scheduled_trips", tags=["scheduled_trips"]
)
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])


@api_router.get("/")
async def api_root():
    return {"message": "API V1 Ready"}
