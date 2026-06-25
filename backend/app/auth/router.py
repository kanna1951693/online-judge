"""
Authentication router: register, login, Google sign-in, and /me endpoint.
"""
import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from backend.app.core.database import get_db
from backend.app.core.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from jose import jwt
from backend.app.core.config import settings
from backend.app.db.models import User
from backend.app.auth.schemas import (
    RegisterPayload, LoginPayload, GoogleLoginPayload,
    SupabaseLoginPayload, TokenResponse, UserMeResponse
)

router = APIRouter()


def _generate_profile_hash(user_id: str) -> str:
    """Create a deterministic profile hash from the user ID."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:32]


def _user_response(user: User) -> UserMeResponse:
    return UserMeResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        profile_hash=user.profile_hash,
        google_connected=user.google_id is not None,
    )


# ── Register ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    # Check uniqueness
    existing = db.scalar(
        select(User).where(
            or_(User.username == payload.username, User.email == payload.email)
        )
    )
    if existing:
        if existing.username == payload.username:
            raise HTTPException(status_code=409, detail="Username already taken")
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        profile_hash=_generate_profile_hash(str(user_id)),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=_user_response(user))


# ── Login ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=_user_response(user))


# ── Google Sign-In ───────────────────────────────────────────────────────────
@router.post("/google-login", response_model=TokenResponse)
def google_login(payload: GoogleLoginPayload, db: Session = Depends(get_db)):
    """
    Accepts a Google ID token. In production, this would verify the token
    via Google's API. For local dev, we decode the payload without verification
    or accept a simulated credential format:
      { "id_token": "sim:<google_id>:<email>:<name>" }
    """
    id_token = payload.id_token

    # ── Simulated credential for local dev ──
    if id_token.startswith("sim:"):
        parts = id_token.split(":", 3)
        if len(parts) != 4:
            raise HTTPException(status_code=400, detail="Invalid simulated token format")
        _, google_id, email, name = parts
    else:
        # ── Real Google token verification ──
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            idinfo = google_id_token.verify_oauth2_token(
                id_token, google_requests.Request()
            )
            google_id = idinfo["sub"]
            email = idinfo.get("email", "")
            name = idinfo.get("name", email.split("@")[0])
        except ImportError:
            # google-auth not installed — treat as simulated
            raise HTTPException(
                status_code=400,
                detail="Google auth library not installed. Use simulated token: sim:<id>:<email>:<name>"
            )
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Google token verification failed: {e}")

    # Check if user exists by google_id
    user = db.scalar(select(User).where(User.google_id == google_id))
    if user:
        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token, user=_user_response(user))

    # Check if email already exists (link Google account)
    user = db.scalar(select(User).where(User.email == email))
    if user:
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token, user=_user_response(user))

    # Create new user
    # Ensure unique username
    base_name = name.replace(" ", "").lower()[:50]
    username = base_name
    counter = 1
    while db.scalar(select(User).where(User.username == username)):
        username = f"{base_name}{counter}"
        counter += 1

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=username,
        email=email,
        google_id=google_id,
        profile_hash=_generate_profile_hash(str(user_id)),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=_user_response(user))


# ── Supabase Google Sign-In ──────────────────────────────────────────────────
@router.post("/supabase-login", response_model=TokenResponse)
def supabase_login(payload: SupabaseLoginPayload, db: Session = Depends(get_db)):
    """
    Accepts a Supabase access token (JWT), verifies it using the project's
    JWT secret, maps/links the user to the existing users table (by email or sub),
    and returns a standard local JWT access token.
    
    Supports simulated tokens starting with 'sim:' for offline local dev/testing.
    """
    token = payload.access_token

    # ── Simulated credential for local dev/testing ──
    if token.startswith("sim:"):
        parts = token.split(":", 2)
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid simulated Supabase token format")
        _, supabase_uid, email = parts
        name = email.split("@")[0]
    else:
        # ── Real Supabase JWT verification ──
        if not settings.SUPABASE_JWT_SECRET or settings.SUPABASE_JWT_SECRET == "supabase-jwt-secret-placeholder-for-dev-only":
            raise HTTPException(
                status_code=500,
                detail="SUPABASE_JWT_SECRET is not configured on the backend."
            )
        try:
            # Decode using Supabase JWT secret
            payload_data = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            supabase_uid = payload_data.get("sub")
            email = payload_data.get("email")
            user_metadata = payload_data.get("user_metadata", {})
            name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Supabase token verification failed: {e}")

    if not email or not supabase_uid:
        raise HTTPException(status_code=400, detail="Token does not contain email or sub claim.")

    # 1. Check if user exists by google_id (reused to store supabase sub / provider identity)
    user = db.scalar(select(User).where(User.google_id == supabase_uid))
    if user:
        local_token = create_access_token(str(user.id))
        return TokenResponse(access_token=local_token, user=_user_response(user))

    # 2. Check if email already exists (link existing account)
    user = db.scalar(select(User).where(User.email == email))
    if user:
        user.google_id = supabase_uid
        db.commit()
        db.refresh(user)
        local_token = create_access_token(str(user.id))
        return TokenResponse(access_token=local_token, user=_user_response(user))

    # 3. Create new user if they don't exist
    # Ensure unique username
    base_name = name.replace(" ", "").lower()[:50]
    username = base_name
    counter = 1
    while db.scalar(select(User).where(User.username == username)):
        username = f"{base_name}{counter}"
        counter += 1

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=username,
        email=email,
        google_id=supabase_uid,
        profile_hash=_generate_profile_hash(str(user_id)),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    local_token = create_access_token(str(user.id))
    return TokenResponse(access_token=local_token, user=_user_response(user))


# ── Me ───────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserMeResponse)
def get_me(user: User = Depends(get_current_user)):
    return _user_response(user)
