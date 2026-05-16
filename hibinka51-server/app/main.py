import logging
from contextlib import asynccontextmanager

from app.api.v1.api import api_router
from app.core.config import settings
from app.services.scheduler_tasks import run_trip_generation_task
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Запуск планировщика задач...")
    scheduler.add_job(
        run_trip_generation_task,
        trigger=CronTrigger(hour=0, minute=5),
        id="daily_trip_generation",
        replace_existing=True,
    )
    scheduler.start()

    yield

    logger.info("Остановка планировщика задач...")
    scheduler.shutdown()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hibinka API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "Welcome to Hibinka API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
