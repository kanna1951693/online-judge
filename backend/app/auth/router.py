"""
Authentication router: local register/login, Supabase OAuth exchange, and /me.
"""
import hashlib
import re
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func

from backend.app.core.database import get_db
from backend.app.core.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from backend.app.core.config import settings
from backend.app.db.models import User
from backend.app.auth.schemas import (
    RegisterPayload, LoginPayload, SupabaseLoginPayload, TokenResponse, UserMeResponse
)

router = APIRouter()


def _generate_profile_hash(user_id: str) -> str:
    """Create a deterministic profile hash from the user ID."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:32]


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _unique_username(db: Session, preferred_name: str | None, email: str) -> str:
    seed = preferred_name or email.split("@")[0] or "user"
    base = re.sub(r"[^a-zA-Z0-9_]", "", seed).lower()[:50]
    if len(base) < 3:
        base = "user"

    username = base
    counter = 1
    while db.scalar(select(User).where(User.username == username)):
        suffix = str(counter)
        username = f"{base[:64 - len(suffix)]}{suffix}"
        counter += 1
    return username


def _read_value(source: Any, key: str, default: Any = None) -> Any:
    if isinstance(source, dict):
        return source.get(key, default)
    return getattr(source, key, default)


def _supabase_configured() -> bool:
    return bool(
        settings.SUPABASE_URL
        and settings.SUPABASE_ANON_KEY
        and "your-project-id" not in settings.SUPABASE_URL
        and "your-anon-key" not in settings.SUPABASE_ANON_KEY
    )


def _verify_supabase_token_with_httpx(access_token: str) -> Any:
    import httpx

    try:
        response = httpx.get(
            f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
            headers={
                "apikey": settings.SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {access_token}",
            },
            timeout=10.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Supabase Auth: {exc}",
        ) from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Supabase access token")
    return response.json()


def _verify_supabase_access_token(access_token: str) -> Any:
    if not access_token:
        raise HTTPException(status_code=400, detail="Supabase access token is required")
    if not _supabase_configured():
        raise HTTPException(
            status_code=500,
            detail="Supabase Auth is not configured on the backend.",
        )

    try:
        from supabase import create_client
    except ImportError:
        return _verify_supabase_token_with_httpx(access_token)

    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        response = supabase.auth.get_user(access_token)
        auth_user = getattr(response, "user", None)
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Supabase token verification failed: {exc}",
        ) from exc

    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid Supabase access token")
    return auth_user


def _extract_supabase_identity(auth_user: Any) -> tuple[str, str, str]:
    supabase_uid = _read_value(auth_user, "id")
    email = _normalize_email(_read_value(auth_user, "email", "") or "")
    metadata = _read_value(auth_user, "user_metadata", {}) or {}
    if not isinstance(metadata, dict):
        metadata = {}

    name = (
        metadata.get("full_name")
        or metadata.get("name")
        or metadata.get("preferred_username")
        or email.split("@")[0]
    )

    if not supabase_uid or not email:
        raise HTTPException(
            status_code=400,
            detail="Supabase user does not contain an id and email.",
        )
    return str(supabase_uid), email, str(name)


def _get_or_create_supabase_user(
    db: Session,
    supabase_uid: str,
    email: str,
    name: str,
) -> User:
    user = db.scalar(select(User).where(User.supabase_auth_id == supabase_uid))
    if user:
        return user

    user = db.scalar(select(User).where(func.lower(User.email) == email))
    if user:
        if user.supabase_auth_id and user.supabase_auth_id != supabase_uid:
            raise HTTPException(
                status_code=409,
                detail="This email is already linked to another Supabase identity.",
            )
        user.supabase_auth_id = supabase_uid
        db.commit()
        db.refresh(user)
        return user

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=_unique_username(db, name, email),
        email=email,
        password_hash=None,
        supabase_auth_id=supabase_uid,
        profile_hash=_generate_profile_hash(str(user_id)),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _user_response(user: User) -> UserMeResponse:
    return UserMeResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        profile_hash=user.profile_hash,
        google_connected=user.supabase_auth_id is not None,
    )


# ── Register ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)

    # Check uniqueness
    existing = db.scalar(
        select(User).where(
            or_(User.username == payload.username, func.lower(User.email) == email)
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
        email=email,
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
    email = _normalize_email(payload.email)
    user = db.scalar(select(User).where(func.lower(User.email) == email))
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=_user_response(user))


# ── Supabase Google Sign-In ──────────────────────────────────────────────────
@router.post("/supabase-login", response_model=TokenResponse)
def supabase_login(payload: SupabaseLoginPayload, db: Session = Depends(get_db)):
    """
    Accepts a Supabase access token, validates it with Supabase Auth, maps or
    creates the matching local user, and returns the app's normal local JWT.
    """
    auth_user = _verify_supabase_access_token(payload.access_token)
    supabase_uid, email, name = _extract_supabase_identity(auth_user)
    user = _get_or_create_supabase_user(db, supabase_uid, email, name)
    local_token = create_access_token(str(user.id))
    return TokenResponse(access_token=local_token, user=_user_response(user))


# ── Me ───────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserMeResponse)
def get_me(user: User = Depends(get_current_user)):
    return _user_response(user)
