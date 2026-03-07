from pydantic import BaseModel
from typing import Optional


class LocationInput(BaseModel):
    latitude: float
    longitude: float
    user_id: Optional[str] = None


class CropCalendarEntry(BaseModel):
    crop: str
    sow_month: int    # 1–12
    harvest_month: int
    notes: Optional[str] = None


class ContextOutput(BaseModel):
    city: str
    district: str
    state: str
    season: str                     # e.g. "Rabi", "Kharif", "Zaid"
    active_crops: list[str]
    crop_calendar: list[CropCalendarEntry]
    coordinates: dict               # {"lat": ..., "lng": ...}
