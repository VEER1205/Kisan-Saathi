from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TransportListingCreate(BaseModel):
    route_from: str = Field(..., min_length=2, max_length=100, description="Origin location")
    route_to: str = Field(..., min_length=2, max_length=100, description="Destination")
    price: float = Field(..., gt=0, description="Price in INR")
    capacity: str = Field(..., description="e.g. '5 ton', '10 quintals'")
    vehicle_type: str = Field(..., description="e.g. 'Tractor', 'Truck', 'Mini-van'")
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class TransportListingUpdate(BaseModel):
    route_from: Optional[str] = None
    route_to: Optional[str] = None
    price: Optional[float] = None
    capacity: Optional[str] = None
    vehicle_type: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class TransportListingOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    route_from: str
    route_to: str
    price: float
    capacity: str
    vehicle_type: str
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    expires_at: datetime
