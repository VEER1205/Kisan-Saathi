from datetime import datetime, timezone, timedelta

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import HTTPException

from config import get_settings
from database import get_database
from models.weather import WeatherResponse, WeatherCondition, WeatherAlert

settings = get_settings()
OWM_URL = "https://api.openweathermap.org/data/2.5/weather"
CACHE_TTL_HOURS = 3

scheduler = AsyncIOScheduler()


def _build_response(district: str, city: str, data: dict, cached_at: datetime | None = None) -> WeatherResponse:
    main = data["main"]
    weather = data["weather"][0]
    wind = data.get("wind", {})
    rain_1h = data.get("rain", {}).get("1h", 0)
    rain_prob = min(int(rain_1h * 50), 100) if rain_1h else 0

    condition = WeatherCondition(
        temperature=main["temp"],
        feels_like=main["feels_like"],
        humidity=main["humidity"],
        condition=weather["main"],
        wind_speed=wind.get("speed", 0),
        rain_probability=rain_prob,
        visibility=data.get("visibility", 10000),
    )

    alerts = []
    temp = main["temp"]
    if temp >= 42:
        alerts.append(WeatherAlert(alert_type="Heat Wave", message="Extreme heat. Irrigate crops early morning. Avoid fieldwork between 11am–4pm.", severity="high"))
    if temp <= 5:
        alerts.append(WeatherAlert(alert_type="Frost Warning", message="Frost risk tonight. Cover frost-sensitive crops with mulch or cloth.", severity="high"))
    if rain_prob >= 70:
        alerts.append(WeatherAlert(alert_type="Heavy Rain", message="High chance of heavy rain. Delay harvesting and ensure drainage channels are clear.", severity="medium"))
    if wind.get("speed", 0) >= 15:
        alerts.append(WeatherAlert(alert_type="High Winds", message="Strong winds expected. Stake tall crops and check greenhouse structures.", severity="medium"))

    # Farmer-friendly forecast summary
    if not alerts:
        summary = f"Weather in {city} is {weather['description']}. Temperature {temp:.0f}°C. Good conditions for fieldwork."
    else:
        summary = f"{alerts[0].message} Temperature: {temp:.0f}°C, Humidity: {main['humidity']}%."

    return WeatherResponse(
        district=district,
        city=city,
        current=condition,
        alerts=alerts,
        forecast_summary=summary,
        cached_at=cached_at,
    )


async def get_weather(district: str) -> WeatherResponse:
    db = get_database()
    now = datetime.now(timezone.utc)
    cache_cutoff = now - timedelta(hours=CACHE_TTL_HOURS)

    # Check cache
    cached = await db["weather_cache"].find_one({
        "district": {"$regex": f"^{district}$", "$options": "i"},
        "cached_at": {"$gte": cache_cutoff},
    })
    if cached:
        return _build_response(district, cached.get("city", district), cached["raw_data"], cached["cached_at"])

    # Fetch live from OpenWeatherMap
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(OWM_URL, params={
            "q": f"{district},IN",
            "appid": settings.openweathermap_api_key,
            "units": "metric",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"OpenWeatherMap error: {resp.text}")
        data = resp.json()

    city = data.get("name", district)

    # Cache in MongoDB
    await db["weather_cache"].update_one(
        {"district": district},
        {"$set": {"city": city, "raw_data": data, "cached_at": now}},
        upsert=True,
    )

    return _build_response(district, city, data, now)


async def _refresh_all_cached_districts():
    """Cron job: refresh weather for all districts stored in the cache."""
    db = get_database()
    async for doc in db["weather_cache"].find({}, {"district": 1}):
        try:
            await get_weather(doc["district"])
        except Exception as e:
            print(f"⚠️  Weather refresh failed for {doc['district']}: {e}")


def start_weather_scheduler():
    """Start APScheduler to refresh weather cache every 3 hours."""
    scheduler.add_job(_refresh_all_cached_districts, "interval", hours=CACHE_TTL_HOURS, id="weather_refresh")
    scheduler.start()
    print("✅ Weather scheduler started (every 3 hours).")
