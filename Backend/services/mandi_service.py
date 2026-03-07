from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from config import get_settings
from database import get_database
from models.mandi import MandiPrice

settings = get_settings()

DATA_GOV_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"


async def _fetch_from_datagovin(crop: str | None, district: str | None, state: str | None) -> list[dict]:
    """Fetch live market data from Data.gov.in Agmarknet API."""
    params = {
        "api-key": settings.datagovin_api_key,
        "format": "json",
        "limit": 100,
    }
    filters = []
    if crop:
        filters.append(f"commodity:{crop}")
    if district:
        filters.append(f"district:{district}")
    if state:
        filters.append(f"state:{state}")
    if filters:
        params["filters"] = ";".join(filters)

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(DATA_GOV_URL, params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch mandi data from Data.gov.in")
        data = resp.json()
        return data.get("records", [])


async def get_prices(crop: str | None = None, district: str | None = None, state: str | None = None) -> list[MandiPrice]:
    db = get_database()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Build MongoDB query
    query: dict = {"date": today}
    if crop:
        query["crop"] = {"$regex": crop, "$options": "i"}
    if district:
        query["district"] = {"$regex": district, "$options": "i"}
    if state:
        query["state"] = {"$regex": state, "$options": "i"}

    # Try cache first
    cached = []
    async for doc in db["mandi_prices"].find(query):
        cached.append(MandiPrice(
            id=str(doc["_id"]),
            crop=doc["crop"],
            variety=doc.get("variety"),
            district=doc["district"],
            state=doc["state"],
            market=doc.get("market"),
            min_price=doc["min_price"],
            max_price=doc["max_price"],
            modal_price=doc["modal_price"],
            date=doc["date"],
            source=doc.get("source", "Data.gov.in"),
            cached_at=doc.get("cached_at"),
        ))

    if cached:
        return cached

    # Cache miss — fetch from API
    records = await _fetch_from_datagovin(crop, district, state)
    prices = []
    now = datetime.now(timezone.utc)

    for r in records:
        doc = {
            "crop": r.get("commodity", ""),
            "variety": r.get("variety"),
            "district": r.get("district", ""),
            "state": r.get("state", ""),
            "market": r.get("market"),
            "min_price": float(r.get("min_price", 0)),
            "max_price": float(r.get("max_price", 0)),
            "modal_price": float(r.get("modal_price", 0)),
            "date": today,
            "source": "Data.gov.in",
            "cached_at": now,
        }
        await db["mandi_prices"].insert_one(doc)
        prices.append(MandiPrice(
            crop=doc["crop"],
            variety=doc.get("variety"),
            district=doc["district"],
            state=doc["state"],
            market=doc.get("market"),
            min_price=doc["min_price"],
            max_price=doc["max_price"],
            modal_price=doc["modal_price"],
            date=doc["date"],
            source=doc["source"],
            cached_at=doc["cached_at"],
        ))
    return prices


async def refresh_cache():
    """Drop today's cache and re-fetch — for admin-triggered refresh."""
    db = get_database()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    await db["mandi_prices"].delete_many({"date": today})
    return await get_prices()
