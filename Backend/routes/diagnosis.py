from fastapi import APIRouter, Depends, UploadFile, File

from models.diagnosis import DiagnosisResult, DiagnosisLogOut
from models.user import UserOut
from services.auth_service import get_current_user
from services import diagnosis_service

router = APIRouter()


@router.post("/", response_model=DiagnosisResult)
async def diagnose(
    file: UploadFile = File(..., description="Crop or leaf image (JPEG/PNG/WebP)"),
    user: UserOut = Depends(get_current_user),
):
    """
    Upload a crop image to diagnose plant disease.
    Returns disease name, confidence score, severity, and treatment recommendations.
    """
    return await diagnosis_service.diagnose_image(file, user.id)


@router.get("/history", response_model=list[DiagnosisLogOut])
async def diagnosis_history(user: UserOut = Depends(get_current_user)):
    """Get the authenticated user's past diagnosis records."""
    return await diagnosis_service.get_user_history(user.id)
