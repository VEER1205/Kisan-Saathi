from datetime import datetime
import httpx
from fastapi import HTTPException

from config import get_settings
from models.context import ContextOutput, CropCalendarEntry

settings = get_settings()

# ── Static season & crop calendar database ────────────────────────────────────
# In production this would be stored in MongoDB `metadata` collection.
# Month is 1-indexed.  Rabi = winter, Kharif = monsoon, Zaid = summer.

SEASON_MAP = {
    # month → season
    11: "Rabi", 12: "Rabi", 1: "Rabi", 2: "Rabi", 3: "Rabi",
    4: "Zaid",  5: "Zaid",
    6: "Kharif", 7: "Kharif", 8: "Kharif", 9: "Kharif", 10: "Kharif",
}

SEASON_CROPS = {
    "Rabi":   ["Wheat", "Mustard", "Barley", "Chickpea", "Lentil"],
    "Kharif": ["Rice", "Maize", "Soybean", "Cotton", "Sugarcane", "Groundnut"],
    "Zaid":   ["Watermelon", "Muskmelon", "Cucumber", "Moong Dal"],
}

CROP_CALENDAR = {
    "Wheat":      CropCalendarEntry(crop="Wheat",      sow_month=11, harvest_month=3),
    "Mustard":    CropCalendarEntry(crop="Mustard",    sow_month=10, harvest_month=2),
    "Rice":       CropCalendarEntry(crop="Rice",       sow_month=6,  harvest_month=10),
    "Maize":      CropCalendarEntry(crop="Maize",      sow_month=6,  harvest_month=9),
    "Cotton":     CropCalendarEntry(crop="Cotton",     sow_month=4,  harvest_month=11),
    "Chickpea":   CropCalendarEntry(crop="Chickpea",   sow_month=10, harvest_month=2),
    "Soybean":    CropCalendarEntry(crop="Soybean",    sow_month=6,  harvest_month=10),
    "Watermelon": CropCalendarEntry(crop="Watermelon", sow_month=3,  harvest_month=5),
    "Sugarcane":  CropCalendarEntry(crop="Sugarcane",  sow_month=2,  harvest_month=12),
}


async def _geocode(lat: float, lng: float) -> dict:
    """Call Google Maps Geocoding API to resolve coordinates → address components."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params={"latlng": f"{lat},{lng}", "key": settings.google_maps_api_key})
        data = resp.json()

    if data.get("status") != "OK":
        raise HTTPException(status_code=502, detail="Google Maps geocoding failed")

    address_components = data["results"][0]["address_components"]
    result = {"city": "", "district": "", "state": "", "country": ""}

    for comp in address_components:
        types = comp["types"]
        if "locality" in types:
            result["city"] = comp["long_name"]
        elif "administrative_area_level_2" in types:
            result["district"] = comp["long_name"]
        elif "administrative_area_level_1" in types:
            result["state"] = comp["long_name"]
        elif "country" in types:
            result["country"] = comp["long_name"]

    return result


async def get_context(lat: float, lng: float) -> ContextOutput:
    address = await _geocode(lat, lng)
    now = datetime.utcnow()
    season = SEASON_MAP.get(now.month, "Kharif")
    active_crops = SEASON_CROPS.get(season, [])
    calendar = [CROP_CALENDAR[c] for c in active_crops if c in CROP_CALENDAR]

    return ContextOutput(
        city=address["city"] or address["district"],
        district=address["district"],
        state=address["state"],
        season=season,
        active_crops=active_crops,
        crop_calendar=calendar,
        coordinates={"lat": lat, "lng": lng},
    )
