from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DiagnosisResult(BaseModel):
    disease_name: str
    confidence: float  # 0.0 – 1.0
    severity: str      # "low", "medium", "high"
    recommendations: list[str]
    image_url: Optional[str] = None


class DiagnosisLogOut(BaseModel):
    id: str
    user_id: str
    image_url: str
    disease_name: str
    confidence: float
    severity: str
    recommendations: list[str]
    created_at: datetime
