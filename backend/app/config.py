from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
        CLIENT_ORIGIN: str
        DATABASE_URL: str
        OPENAI_API_KEY: Optional[str] = None
        class Config:
                env_file = './.env'

settings = Settings()