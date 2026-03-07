from fastapi import APIRouter, Query, Depends

from models.mandi import MandiPrice
from models.user import UserOut
from services.auth_service import get_current_user
from services import mandi_service

router = APIRouter()


@router.get("/", response_model=list[MandiPrice])
async def get_prices(
    crop: str | None = Query(None, description="Filter by crop name e.g. 'wheat'"),
    district: str | None = Query(None, description="Filter by district name"),
    state: str | None = Query(None, description="Filter by state name"),
):
    """
    Get today's mandi (market) prices.
    Results are cached in MongoDB and refreshed daily from Data.gov.in.
    """
    return await mandi_service.get_prices(crop, district, state)


@router.post("/refresh", response_model=list[MandiPrice])
async def refresh_prices(user: UserOut = Depends(get_current_user)):
    """
    Force-refresh today's mandi price cache from Data.gov.in.
    Useful for admins when new prices arrive.
    """
    return await mandi_service.refresh_cache()
