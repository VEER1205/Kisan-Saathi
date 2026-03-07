from fastapi import APIRouter, Depends, Path

from models.transport import TransportListingCreate, TransportListingUpdate, TransportListingOut
from models.user import UserOut
from services.auth_service import get_current_user
from services import transport_service

router = APIRouter()


@router.get("/", response_model=list[TransportListingOut])
async def list_listings():
    """Get all active transport listings (not yet expired)."""
    return await transport_service.get_active_listings()


@router.post("/", response_model=TransportListingOut, status_code=201)
async def create_listing(
    data: TransportListingCreate,
    user: UserOut = Depends(get_current_user),
):
    """Create a new transport listing. Expires automatically after 24 hours."""
    return await transport_service.create_listing(data, user.id, user.name)


@router.put("/{listing_id}", response_model=TransportListingOut)
async def update_listing(
    listing_id: str = Path(...),
    data: TransportListingUpdate = None,
    user: UserOut = Depends(get_current_user),
):
    """Update a transport listing. Only the listing owner can update."""
    return await transport_service.update_listing(listing_id, data, user.id)


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: str = Path(...),
    user: UserOut = Depends(get_current_user),
):
    """Delete a transport listing. Only the listing owner can delete."""
    await transport_service.delete_listing(listing_id, user.id)
