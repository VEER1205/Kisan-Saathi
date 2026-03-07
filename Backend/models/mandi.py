from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MandiPrice(BaseModel):
    id: Optional[str] = None
    crop: str
    variety: Optional[str] = None
    district: str
    state: str
    market: Optional[str] = None
    min_price: float  # INR per quintal
    max_price: float
    modal_price: float
    date: str         # YYYY-MM-DD
    source: str = "Data.gov.in"
    cached_at: Optional[datetime] = None


class MandiSearchQuery(BaseModel):
    crop: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
