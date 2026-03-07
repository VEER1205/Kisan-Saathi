from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, Path

from models.community import PostOut, CommentOut, CommentCreate
from models.user import UserOut
from services.auth_service import get_current_user
from services import community_service

router = APIRouter()


@router.get("/feed", response_model=list[PostOut])
async def get_feed(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
):
    """Get a paginated list of community posts, newest first."""
    return await community_service.get_feed(skip, limit)


@router.post("/", response_model=PostOut, status_code=201)
async def create_post(
    caption: str = Form(...),
    tags: str = Form("", description="Comma-separated tags e.g. 'wheat,disease,advice'"),
    file: UploadFile = File(..., description="Crop image (JPEG/PNG/WebP)"),
    user: UserOut = Depends(get_current_user),
):
    """Upload a photo with a caption to the community feed."""
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    return await community_service.create_post(caption, tag_list, file, user.id, user.name)


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str = Path(...),
    user: UserOut = Depends(get_current_user),
):
    """Like or unlike a community post. Returns updated like count."""
    return await community_service.toggle_like(post_id, user.id)


@router.post("/{post_id}/comment", response_model=CommentOut, status_code=201)
async def add_comment(
    post_id: str = Path(...),
    body: CommentCreate = None,
    user: UserOut = Depends(get_current_user),
):
    """Add a comment to a community post."""
    return await community_service.add_comment(post_id, body.text, user.id, user.name)


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: str = Path(...),
    user: UserOut = Depends(get_current_user),
):
    """Delete your own community post."""
    await community_service.delete_post(post_id, user.id)
