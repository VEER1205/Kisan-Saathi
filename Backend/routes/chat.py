from fastapi import APIRouter, Depends

from models.chat import ChatRequest, ChatResponse, ChatHistoryOut
from models.user import UserOut
from services.auth_service import get_current_user
from services import chat_service

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user: UserOut = Depends(get_current_user),
):
    """
    Send a message to Kisan Mitra AI.
    Optionally pass `session_id` to continue an existing conversation.
    A new `session_id` is created if omitted.
    """
    return await chat_service.send_message(request.message, request.session_id, user.id)


@router.get("/history/{session_id}", response_model=ChatHistoryOut)
async def get_chat_history(
    session_id: str,
    user: UserOut = Depends(get_current_user),
):
    """Retrieve full message history for a chat session."""
    return await chat_service.get_history(session_id, user.id)
