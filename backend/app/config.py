from pydantic_settings import BaseSettings

class Settings(BaseSettings):
        CLIENT_ORIGIN: str
        DATABASE_URL: str
        class Config:
                env_file = './.env'

settings = Settings()