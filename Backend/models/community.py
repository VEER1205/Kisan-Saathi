from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CommentOut(BaseModel):
    user_id: str
    user_name: str
    text: str
    created_at: datetime


class PostCreate(BaseModel):
    caption: str = Field(..., min_length=1, max_length=500)
    tags: list[str] = []  # e.g. ["wheat", "pest", "advice"]


class PostOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    image_url: Optional[str] = None
    caption: str
    tags: list[str]
    likes: list[str]          # list of user_ids who liked
    likes_count: int
    comments: list[CommentOut]
    comments_count: int
    created_at: datetime


class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=300)
