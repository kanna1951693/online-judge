import os
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[3]

ENV_FILES = tuple(
    str(path)
    for path in (
        ROOT_DIR / ".env",
        ROOT_DIR / ".env.local",
        ROOT_DIR / "backend" / ".env",
        ROOT_DIR / "backend" / ".env.local",
    )
    if path.exists()
)


def normalize_database_url(url: str) -> str:
    """Normalize Supabase/Postgres URLs for SQLAlchemy + psycopg2."""
    if not url:
        return url

    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://") :]
    elif url.startswith("postgresql://") and "+psycopg2" not in url.split("://", 1)[0]:
        url = "postgresql+psycopg2://" + url[len("postgresql://") :]

    parsed = urlparse(url)
    if "supabase" in parsed.netloc or "supabase" in parsed.path:
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        query.setdefault("sslmode", "require")
        url = urlunparse(parsed._replace(query=urlencode(query)))

    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILES or (".env",),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    SUBMISSION_QUEUE_NAME: str = "submissions"

    # PostgreSQL (local default; override with Supabase connection string)
    DATABASE_URL: str = (
        "postgresql+psycopg2://apexjudge:apexjudge_secret@localhost:5432/apexjudge"
    )

    # Filesystem paths (legacy — used during seeding only)
    PROBLEMS_JSON_PATH: str = os.getenv(
        "PROBLEMS_JSON_PATH",
        str(ROOT_DIR / "backend" / "app" / "problems.json"),
    )
    PROBLEMS_DIR: str = os.getenv(
        "PROBLEMS_DIR",
        str(ROOT_DIR / "backend" / "problems"),
    )

    # Sandbox temp directory
    SANDBOX_TEMP_DIR: str = os.getenv(
        "SANDBOX_TEMP_DIR",
        "/app/backend/temp/submissions"
        if os.path.exists("/app")
        else str(ROOT_DIR / "backend" / "temp" / "submissions"),
    )

    # Bundled library paths (injected into sandbox containers)
    SANDBOX_LIB_DIR: str = os.getenv(
        "SANDBOX_LIB_DIR",
        "/app/backend/sandbox/lib"
        if os.path.exists("/app")
        else str(ROOT_DIR / "backend" / "sandbox" / "lib"),
    )

    HOST_WORKSPACE_PATH: str = os.getenv("HOST_WORKSPACE_PATH", str(ROOT_DIR))

    # Judge execution limits (per-problem values override these defaults)
    DEFAULT_TIME_LIMIT_MS: int = 2000
    DEFAULT_MEMORY_LIMIT_KB: int = 262144  # 256 MB

    # Standalone compiler page limits (independent of judge)
    COMPILER_TIME_LIMIT_SEC: float = 10.0
    COMPILER_MEMORY_LIMIT_MB: int = 256

    DOCKER_TIMEOUT_GRACE_SEC: float = 0.5

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Auth / JWT
    JWT_SECRET_KEY: str = "apexjudge-dev-secret-key-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 72

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        return normalize_database_url(value)


settings = Settings()
