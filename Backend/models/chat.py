from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatMessageRole(str):
    user = "user"
    model = "model"


class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # Continue existing session if provided


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    timestamp: datetime


class ChatHistoryOut(BaseModel):
    session_id: str
    messages: list[ChatMessage]
    created_at: datetime
    updated_at: datetime
