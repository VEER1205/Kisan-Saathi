import io
from datetime import datetime, timezone

import cloudinary
import cloudinary.uploader
from PIL import Image
from bson import ObjectId
from fastapi import UploadFile, HTTPException

from config import get_settings
from database import get_database
from models.diagnosis import DiagnosisResult, DiagnosisLogOut

settings = get_settings()

# ── Cloudinary setup ───────────────────────────────────────────────────────────
def _configure_cloudinary():
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )


# ── ML Model stub ──────────────────────────────────────────────────────────────
# TODO: Replace this stub with actual TensorFlow/PyTorch inference.
# Model interface: accepts a PIL Image, returns (class_name, confidence)
def _run_model(image: Image.Image) -> tuple[str, float]:
    """
    Placeholder — returns mock result.
    Replace with:
        model = tf.keras.models.load_model("model.h5")
        img_array = preprocess(image)
        predictions = model.predict(img_array)
        class_idx = np.argmax(predictions)
        return CLASS_NAMES[class_idx], float(predictions[0][class_idx])
    """
    return "Healthy Crop", 0.95  # mock


DISEASE_RECOMMENDATIONS = {
    "Healthy Crop": ["Continue regular watering and fertilization.", "Monitor for early pest signs."],
    "Leaf Blight": ["Remove affected leaves immediately.", "Apply copper-based fungicide.", "Improve field drainage."],
    "Powdery Mildew": ["Apply sulfur-based fungicide.", "Avoid overhead irrigation.", "Ensure good air circulation."],
    "Root Rot": ["Reduce watering frequency.", "Apply systemic fungicide to soil.", "Check drainage channels."],
    "Aphid Infestation": ["Spray neem oil solution (5 ml/litre).", "Introduce ladybird beetles.", "Remove heavily infested shoots."],
    "Rust Disease": ["Apply propiconazole fungicide.", "Avoid water stress.", "Use resistant varieties next season."],
}


def _get_severity(confidence: float, disease: str) -> str:
    if disease == "Healthy Crop":
        return "none"
    if confidence > 0.85:
        return "high"
    if confidence > 0.60:
        return "medium"
    return "low"


async def diagnose_image(file: UploadFile, user_id: str) -> DiagnosisResult:
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted.")

    contents = await file.read()

    # Preprocess image
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((224, 224))

    # Run model
    disease_name, confidence = _run_model(image)
    severity = _get_severity(confidence, disease_name)
    recommendations = DISEASE_RECOMMENDATIONS.get(
        disease_name, ["Consult your local agriculture extension officer."]
    )

    # Upload original image to Cloudinary
    _configure_cloudinary()
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(contents),
        folder="kisan_sathi/diagnosis",
        resource_type="image",
    )
    image_url = upload_result["secure_url"]

    # Save diagnosis log to MongoDB
    db = get_database()
    now = datetime.now(timezone.utc)
    await db["diagnosis_logs"].insert_one({
        "user_id": user_id,
        "image_url": image_url,
        "disease_name": disease_name,
        "confidence": confidence,
        "severity": severity,
        "recommendations": recommendations,
        "created_at": now,
    })

    return DiagnosisResult(
        disease_name=disease_name,
        confidence=confidence,
        severity=severity,
        recommendations=recommendations,
        image_url=image_url,
    )


async def get_user_history(user_id: str) -> list[DiagnosisLogOut]:
    db = get_database()
    cursor = db["diagnosis_logs"].find({"user_id": user_id}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(DiagnosisLogOut(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            image_url=doc["image_url"],
            disease_name=doc["disease_name"],
            confidence=doc["confidence"],
            severity=doc["severity"],
            recommendations=doc["recommendations"],
            created_at=doc["created_at"],
        ))
    return results
