from app.config import settings
import os
from dotenv import load_dotenv

load_dotenv()
print(f"DATABASE_URL (repr): {repr(settings.DATABASE_URL)}")
print(f"OS ENV DATABASE_URL (repr): {repr(os.getenv('DATABASE_URL'))}")
