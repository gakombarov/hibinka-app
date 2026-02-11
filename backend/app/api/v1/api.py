from fastapi import APIRouter
from app.api.v1.endpoints import auth, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])


@api_router.get("/")
async def api_root():
    return {"message": "API V1 Ready"}
