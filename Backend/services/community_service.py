import io
from datetime import datetime, timezone

import cloudinary
import cloudinary.uploader
from bson import ObjectId
from fastapi import UploadFile, HTTPException

from config import get_settings
from database import get_database
from models.community import PostOut, CommentOut

settings = get_settings()


def _configure_cloudinary():
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )


def _doc_to_post(doc: dict) -> PostOut:
    return PostOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        user_name=doc["user_name"],
        image_url=doc["image_url"],
        caption=doc["caption"],
        tags=doc.get("tags", []),
        likes=[str(uid) for uid in doc.get("likes", [])],
        likes_count=len(doc.get("likes", [])),
        comments=[
            CommentOut(
                user_id=c["user_id"],
                user_name=c["user_name"],
                text=c["text"],
                created_at=c["created_at"],
            )
            for c in doc.get("comments", [])
        ],
        comments_count=len(doc.get("comments", [])),
        created_at=doc["created_at"],
    )


async def get_feed(skip: int = 0, limit: int = 20) -> list[PostOut]:
    db = get_database()
    cursor = db["community_posts"].find().sort("created_at", -1).skip(skip).limit(limit)
    posts = []
    async for doc in cursor:
        posts.append(_doc_to_post(doc))
    return posts


async def create_post(caption: str, tags: list[str], file: UploadFile, user_id: str, user_name: str) -> PostOut:
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted.")

    contents = await file.read()

    _configure_cloudinary()
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(contents),
        folder="kisan_sathi/community",
        resource_type="image",
    )
    image_url = upload_result["secure_url"]

    db = get_database()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "user_name": user_name,
        "image_url": image_url,
        "caption": caption,
        "tags": tags,
        "likes": [],
        "comments": [],
        "created_at": now,
    }
    result = await db["community_posts"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_post(doc)


async def toggle_like(post_id: str, user_id: str) -> dict:
    db = get_database()
    post = await db["community_posts"].find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    uid = ObjectId(user_id)
    if uid in post.get("likes", []):
        await db["community_posts"].update_one({"_id": ObjectId(post_id)}, {"$pull": {"likes": uid}})
        liked = False
    else:
        await db["community_posts"].update_one({"_id": ObjectId(post_id)}, {"$push": {"likes": uid}})
        liked = True

    updated = await db["community_posts"].find_one({"_id": ObjectId(post_id)})
    return {"liked": liked, "likes_count": len(updated.get("likes", []))}


async def add_comment(post_id: str, text: str, user_id: str, user_name: str) -> CommentOut:
    db = get_database()
    post = await db["community_posts"].find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    now = datetime.now(timezone.utc)
    comment = {
        "user_id": user_id,
        "user_name": user_name,
        "text": text,
        "created_at": now,
    }
    await db["community_posts"].update_one({"_id": ObjectId(post_id)}, {"$push": {"comments": comment}})
    return CommentOut(**comment)


async def delete_post(post_id: str, user_id: str):
    db = get_database()
    post = await db["community_posts"].find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(post["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    await db["community_posts"].delete_one({"_id": ObjectId(post_id)})
