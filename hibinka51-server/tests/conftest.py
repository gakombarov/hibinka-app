import uuid
from datetime import date, time

import pytest_asyncio
from app.api.deps import get_current_active_user, get_current_admin_user
from app.core.database import Base, get_db
from app.main import app
from app.models.trip import PaymentStatus, Trip, TripStatus
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleCategory
from httpx import ASGITransport, AsyncClient
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.compiler import compiles


@compiles(UUID, "sqlite")
def compile_uuid_sqlite(element, compiler, **kw):
    return "TEXT"


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = async_sessionmaker(
    bind=engine_test, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


def override_get_current_user():
    return User(
        id=uuid.uuid4(),
        email="admin@test.ru",
        account_type=UserRole.ADMIN,
        is_active=True,
        is_superuser=True,
    )


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_admin_user] = override_get_current_user
app.dependency_overrides[get_current_active_user] = override_get_current_user


@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def mock_vehicle_small(db_session: AsyncSession):
    vehicle = Vehicle(
        id=uuid.uuid4(),
        alias="Малый Спринтер",
        brand="Mercedes-Benz",
        model="Sprinter",
        license_plate="А111АА51",
        capacity=8,
        category=VehicleCategory.MINIBUS,
        is_active=True,
    )
    db_session.add(vehicle)
    await db_session.commit()
    await db_session.refresh(vehicle)
    return vehicle


@pytest_asyncio.fixture
async def mock_trip_large(db_session: AsyncSession):
    trip = Trip(
        id=uuid.uuid4(),
        trip_date=date(2026, 12, 1),
        departure_time=time(12, 0),
        departure_location="Кировск",
        arrival_location="Аэропорт",
        passenger_count=15,
        status=TripStatus.PLANNED,
        payment_status=PaymentStatus.PENDING,
        total_amount=5000,
        paid_amount=0,
    )
    db_session.add(trip)
    await db_session.commit()
    await db_session.refresh(trip)
    return trip
