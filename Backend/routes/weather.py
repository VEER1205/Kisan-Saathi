from fastapi import APIRouter, Path

from models.weather import WeatherResponse
from services import weather_service

router = APIRouter()


@router.get("/{district}", response_model=WeatherResponse)
async def get_weather(district: str = Path(..., description="District name e.g. 'Nashik', 'Ludhiana'")):
    """
    Get current weather and farmer alerts for a district.
    Results are cached for 3 hours. Alerts are generated for heat waves,
    frost, heavy rain, and high winds.
    """
    return await weather_service.get_weather(district)
