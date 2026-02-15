from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, booking, scheduled_trips

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(booking.router, prefix="/booking", tags=["booking"])
api_router.include_router(
    scheduled_trips.router, prefix="/scheduled_trips", tags=["scheduled_trips"]
)


@api_router.get("/")
async def api_root():
    return {"message": "API V1 Ready"}
