from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

# Build DATABASE URL for localhost with username and password as "postgres"
DATABASE_URL = settings.DATABASE_URL
# Create engine

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)

print("Database Engine Initialized")
# Session factory
async_session_maker = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for our models
Base = declarative_base()