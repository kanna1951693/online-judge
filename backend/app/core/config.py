import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    PROBLEMS_JSON_PATH: str = os.getenv("PROBLEMS_JSON_PATH", "/Users/kunalb/online-judge/backend/app/problems.json")
    PROBLEMS_DIR: str = os.getenv("PROBLEMS_DIR", "/Users/kunalb/online-judge/backend/problems")
    SUBMISSION_QUEUE_NAME: str = "submissions"
    DOCKER_TIMEOUT_GRACE_SEC: float = 0.5

settings = Settings()
