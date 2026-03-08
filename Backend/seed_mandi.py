"""
Seed script: inserts today's sample mandi prices into MongoDB.
Run with: python seed_mandi.py
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "kisan_sathi")

SAMPLE_PRICES = [
    {"crop": "Onion",   "variety": "Grade A", "district": "Nashik",  "state": "Maharashtra", "market": "Nashik APMC",     "min_price": 2400, "max_price": 3100, "modal_price": 2750},
    {"crop": "Wheat",   "variety": "Grade A", "district": "Nashik",  "state": "Maharashtra", "market": "Nashik APMC",     "min_price": 2150, "max_price": 2400, "modal_price": 2275},
    {"crop": "Tomato",  "variety": "Mixed",   "district": "Nashik",  "state": "Maharashtra", "market": "Nashik APMC",     "min_price": 900,  "max_price": 1500, "modal_price": 1200},
    {"crop": "Soybean", "variety": "Grade B", "district": "Nashik",  "state": "Maharashtra", "market": "Nashik APMC",     "min_price": 3900, "max_price": 4300, "modal_price": 4100},
    {"crop": "Maize",   "variety": "Grade A", "district": "Nashik",  "state": "Maharashtra", "market": "Nashik APMC",     "min_price": 1750, "max_price": 2050, "modal_price": 1890},
    {"crop": "Cotton",  "variety": "Medium",  "district": "Akola",   "state": "Maharashtra", "market": "Akola APMC",      "min_price": 6800, "max_price": 7400, "modal_price": 7121},
    {"crop": "Potato",  "variety": "Grade A", "district": "Pune",    "state": "Maharashtra", "market": "Pune APMC",       "min_price": 1200, "max_price": 1600, "modal_price": 1380},
    {"crop": "Rice",    "variety": "Common",  "district": "Kolhapur","state": "Maharashtra", "market": "Kolhapur APMC",   "min_price": 2100, "max_price": 2500, "modal_price": 2300},
]

async def seed():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now = datetime.now(timezone.utc)

    # Remove old entries for today if any
    deleted = await db["mandi_prices"].delete_many({"date": today})
    if deleted.deleted_count:
        print(f"🗑️  Cleared {deleted.deleted_count} old entries for {today}")

    docs = [{**p, "date": today, "source": "seed_data", "cached_at": now} for p in SAMPLE_PRICES]
    result = await db["mandi_prices"].insert_many(docs)
    print(f"✅ Inserted {len(result.inserted_ids)} mandi price records for {today}")

    # Verify
    count = await db["mandi_prices"].count_documents({"date": today})
    print(f"📊 Total prices in DB for today: {count}")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
