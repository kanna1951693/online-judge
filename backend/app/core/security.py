"""
Security utilities: password hashing (bcrypt), JWT token creation/verification,
and FastAPI dependency injection for authenticated routes.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.db.models import User

# ── Password hashing ────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT tokens ───────────────────────────────────────────────────────────────
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "sub": user_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[str]:
    """Returns the user_id (sub) if valid, else None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ── FastAPI dependencies ─────────────────────────────────────────────────────
import hashlib
import re
from sqlalchemy import func

bearer_scheme = HTTPBearer(auto_error=False)


def _generate_profile_hash(user_id: str) -> str:
    """Create a deterministic profile hash from the user ID."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:32]


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


def get_or_create_supabase_user(
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


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Require authentication — raises 401 if missing/invalid. Supports local JWTs and Supabase Auth JWTs."""
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = creds.credentials

    # 1. Try local JWT
    user_id = verify_access_token(token)
    if user_id:
        try:
            user = db.scalar(select(User).where(User.id == uuid.UUID(user_id)))
            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
            return user
        except ValueError:
            pass

    # 2. Try Supabase JWT
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            email = payload.get("email")
            supabase_uid = payload.get("sub")
            if email and supabase_uid:
                user_metadata = payload.get("user_metadata", {}) or {}
                name = (
                    user_metadata.get("full_name")
                    or user_metadata.get("name")
                    or user_metadata.get("preferred_username")
                    or email.split("@")[0]
                )
                return get_or_create_supabase_user(db, supabase_uid, email, name)
        except JWTError:
            pass

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_optional_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optional authentication — returns None if not logged in. Supports local JWTs and Supabase Auth JWTs."""
    if not creds:
        return None
    
    token = creds.credentials

    # 1. Try local JWT
    user_id = verify_access_token(token)
    if user_id:
        try:
            return db.scalar(select(User).where(User.id == uuid.UUID(user_id)))
        except ValueError:
            pass

    # 2. Try Supabase JWT
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            email = payload.get("email")
            supabase_uid = payload.get("sub")
            if email and supabase_uid:
                user_metadata = payload.get("user_metadata", {}) or {}
                name = (
                    user_metadata.get("full_name")
                    or user_metadata.get("name")
                    or user_metadata.get("preferred_username")
                    or email.split("@")[0]
                )
                return get_or_create_supabase_user(db, supabase_uid, email, name)
        except JWTError:
            pass

    return None
