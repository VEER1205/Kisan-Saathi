from fastapi import APIRouter, Depends

from models.context import LocationInput, ContextOutput
from models.user import UserOut
from services.auth_service import get_current_user
from services import context_service

router = APIRouter()


@router.post("/", response_model=ContextOutput)
async def get_context(
    location: LocationInput,
    user: UserOut = Depends(get_current_user),
):
    """
    Provide GPS coordinates to get:
    - Resolved city and district name
    - Current agricultural season (Rabi / Kharif / Zaid)
    - List of active crops for this season
    - Crop sowing/harvesting calendar
    """
    return await context_service.get_context(location.latitude, location.longitude)
