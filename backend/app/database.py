from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Build DATABASE URL for localhost with username and password as "postgres"
DATABASE_URL = settings.DATABASE_URL
# DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/real_time_poll_rooms"
# Create engine
engine = create_async_engine(DATABASE_URL, echo=False, future=True, pool_pre_ping=True)

# Session factory
async_session_maker = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for our models
Base = declarative_base()