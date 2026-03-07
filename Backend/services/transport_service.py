from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from database import get_database
from models.transport import TransportListingCreate, TransportListingUpdate, TransportListingOut


TTL_HOURS = 24


async def create_ttl_index():
    """Create a TTL index on transport_listings.expires_at (run once at startup)."""
    db = get_database()
    await db["transport_listings"].create_index(
        "expires_at", expireAfterSeconds=0
    )
    print("✅ TTL index on transport_listings.expires_at is ready.")


def _listing_to_out(doc: dict, user_name: str = "") -> TransportListingOut:
    return TransportListingOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        user_name=doc.get("user_name", user_name),
        route_from=doc["route_from"],
        route_to=doc["route_to"],
        price=doc["price"],
        capacity=doc["capacity"],
        vehicle_type=doc["vehicle_type"],
        contact_phone=doc.get("contact_phone"),
        notes=doc.get("notes"),
        created_at=doc["created_at"],
        expires_at=doc["expires_at"],
    )


async def get_active_listings() -> list[TransportListingOut]:
    db = get_database()
    now = datetime.now(timezone.utc)
    cursor = db["transport_listings"].find({"expires_at": {"$gt": now}}).sort("created_at", -1)
    listings = []
    async for doc in cursor:
        listings.append(_listing_to_out(doc))
    return listings


async def create_listing(data: TransportListingCreate, user_id: str, user_name: str) -> TransportListingOut:
    db = get_database()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "user_name": user_name,
        **data.model_dump(),
        "created_at": now,
        "expires_at": now + timedelta(hours=TTL_HOURS),
    }
    result = await db["transport_listings"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _listing_to_out(doc, user_name)


async def update_listing(listing_id: str, data: TransportListingUpdate, user_id: str) -> TransportListingOut:
    db = get_database()
    listing = await db["transport_listings"].find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if str(listing["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your listing")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        await db["transport_listings"].update_one({"_id": ObjectId(listing_id)}, {"$set": updates})

    updated = await db["transport_listings"].find_one({"_id": ObjectId(listing_id)})
    return _listing_to_out(updated)


async def delete_listing(listing_id: str, user_id: str):
    db = get_database()
    listing = await db["transport_listings"].find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if str(listing["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your listing")
    await db["transport_listings"].delete_one({"_id": ObjectId(listing_id)})
