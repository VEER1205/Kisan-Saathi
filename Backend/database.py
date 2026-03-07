from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None


async def connect_db():
    """Create MongoDB connection on app startup."""
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri)
    print(f"✅ Connected to MongoDB at {settings.mongodb_uri}")


async def close_db():
    """Close MongoDB connection on app shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    return client[settings.database_name]
