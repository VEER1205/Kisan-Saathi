from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId

from database import get_database
from models.user import UserCreate, UserOut, Token
from services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db = get_database()

    # Check duplicate email
    if await db["users"].find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password_hash": hash_password(user.password),
        "role": user.role,
        "crops": user.crops,
        "vehicle_info": user.vehicle_info,
    }
    result = await db["users"].insert_one(doc)
    return UserOut(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        crops=user.crops,
        vehicle_info=user.vehicle_info,
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email (as username) and password. Returns JWT token."""
    db = get_database()
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user["_id"])})
    return Token(
        access_token=token,
        user=UserOut(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            phone=user["phone"],
            role=user["role"],
            crops=user.get("crops", []),
            vehicle_info=user.get("vehicle_info"),
        ),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    """Get currently authenticated user's profile."""
    return current_user
