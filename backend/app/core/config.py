import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SUBMISSION_QUEUE_NAME: str = "submissions"

    # PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://apexjudge:apexjudge_secret@localhost:5432/apexjudge"
    )

    # Filesystem paths (legacy — used during seeding only)
    PROBLEMS_JSON_PATH: str = os.getenv(
        "PROBLEMS_JSON_PATH",
        "/Users/kunalb/online-judge/backend/app/problems.json"
    )
    PROBLEMS_DIR: str = os.getenv(
        "PROBLEMS_DIR",
        "/Users/kunalb/online-judge/backend/problems"
    )

    # Sandbox temp directory
    SANDBOX_TEMP_DIR: str = os.getenv(
        "SANDBOX_TEMP_DIR",
        "/app/backend/temp/submissions" if os.path.exists("/app") else "/Users/kunalb/online-judge/backend/temp/submissions"
    )

    # Bundled library paths (injected into sandbox containers)
    SANDBOX_LIB_DIR: str = os.getenv(
        "SANDBOX_LIB_DIR",
        "/app/backend/sandbox/lib" if os.path.exists("/app") else "/Users/kunalb/online-judge/backend/sandbox/lib"
    )

    HOST_WORKSPACE_PATH: str = os.getenv(
        "HOST_WORKSPACE_PATH",
        "/Users/kunalb/online-judge"
    )

    # Judge execution limits (per-problem values override these defaults)
    DEFAULT_TIME_LIMIT_MS: int = 2000
    DEFAULT_MEMORY_LIMIT_KB: int = 262144  # 256 MB

    # Standalone compiler page limits (independent of judge)
    COMPILER_TIME_LIMIT_SEC: float = 10.0
    COMPILER_MEMORY_LIMIT_MB: int = 256

    DOCKER_TIMEOUT_GRACE_SEC: float = 0.5

    # Supabase Auth
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

    # Auth / JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "apexjudge-dev-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 72

settings = Settings()
