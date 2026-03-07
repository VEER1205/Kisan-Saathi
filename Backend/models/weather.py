from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WeatherCondition(BaseModel):
    temperature: float      # Celsius
    feels_like: float
    humidity: int           # Percentage
    condition: str          # e.g. "Clear", "Rain", "Thunderstorm"
    wind_speed: float       # m/s
    rain_probability: int   # 0–100 (%)
    visibility: int         # metres


class WeatherAlert(BaseModel):
    alert_type: str         # e.g. "Heavy Rain", "Frost", "Heat Wave"
    message: str
    severity: str           # "low", "medium", "high"


class WeatherResponse(BaseModel):
    district: str
    city: str
    current: WeatherCondition
    alerts: list[WeatherAlert]
    forecast_summary: str   # Human-readable 1-liner for farmers
    cached_at: Optional[datetime] = None
