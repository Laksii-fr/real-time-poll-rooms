import asyncio
import asyncpg
import os
from dotenv import load_dotenv

async def test_conn():
    load_dotenv()
    url = os.getenv("DATABASE_URL")
    # asyncpg expects postgresql:// (not postgresql+asyncpg://)
    clean_url = url.replace("postgresql+asyncpg://", "postgresql://")
    print(f"Testing URL: {clean_url}")
    try:
        # asyncpg connection
        conn = await asyncpg.connect(clean_url)
        print("Successfully connected via asyncpg!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    asyncio.run(test_conn())
