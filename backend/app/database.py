from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Build DATABASE URL for localhost with username and password as "postgres"
DATABASE_URL = settings.DATABASE_URL.strip().rstrip('?')
# Create engine
engine = create_async_engine(
    DATABASE_URL, 
    echo=False, 
    future=True,
    connect_args={"ssl": True}
)
print("Database Engine Initialized with asyncpg and explicit SSL")
# Session factory
async_session_maker = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for our models
Base = declarative_base()