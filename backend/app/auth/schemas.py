from pydantic import BaseModel, Field
from typing import Optional


class RegisterPayload(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class LoginPayload(BaseModel):
    email: str
    password: str


class GoogleLoginPayload(BaseModel):
    """Receives a Google ID token (from frontend Google Sign-In)."""
    id_token: str  # The Google credential JWT


class SupabaseLoginPayload(BaseModel):
    """Receives a Supabase Auth access token (JWT)."""
    access_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserMeResponse"


class UserMeResponse(BaseModel):
    id: str
    username: str
    email: str
    profile_hash: str
    google_connected: bool

    class Config:
        from_attributes = True


# Forward reference resolution
TokenResponse.model_rebuild()
