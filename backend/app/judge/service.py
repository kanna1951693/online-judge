import json
import uuid
import redis
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.db.models import Problem, TestCase, Submission, SubmissionResult, Language, Verdict
from backend.app.core.config import settings

r = redis.from_url(settings.REDIS_URL)

def get_problems(db: Session, program: str = None, tag: str = None):
    stmt = select(Problem)
    if program:
        stmt = stmt.where(Problem.programs.any(program))
    if tag:
        stmt = stmt.where(Problem.tags.any(tag))
    return db.scalars(stmt).all()

def get_all_tags(db: Session):
    problems_tags = db.scalars(select(Problem.tags)).all()
    unique_tags = set()
    for tags_list in problems_tags:
        if tags_list:
            unique_tags.update(tags_list)
    return sorted(list(unique_tags))

def get_problem_by_slug(db: Session, slug: str):
    return db.scalar(select(Problem).where(Problem.slug == slug))

def create_submission(db: Session, problem_id: str, language: str, source_code: str, user_id: str = None):
    # Validate language mapping
    try:
        lang_enum = Language[language.lower().strip()]
    except KeyError:
        raise ValueError(f"Unsupported language: {language}")

    # Create submission record in DB
    sub = Submission(
        problem_id=uuid.UUID(problem_id),
        user_id=uuid.UUID(user_id) if user_id else None,
        language=lang_enum,
        source_code=source_code,
        verdict=Verdict.PENDING
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    # Push job payload to Redis queue for the worker
    job_payload = {
        "submission_id": str(sub.id),
        "problem_id": problem_id,
        "language": language.lower().strip(),
        "source_code": source_code
    }
    r.rpush(settings.SUBMISSION_QUEUE_NAME, json.dumps(job_payload))
    
    # Also set a status key in Redis for fallback/legacy compatibility
    redis_state = {
        "submission_id": str(sub.id),
        "problem_id": problem_id,
        "language": language.lower().strip(),
        "status": "QUEUED",
        "verdict": None,
        "error_message": None,
        "test_cases": []
    }
    r.set(f"submission:{sub.id}", json.dumps(redis_state))
    
    return sub

def get_submission(db: Session, submission_id: str):
    try:
        sub_uuid = uuid.UUID(submission_id)
    except ValueError:
        return None
    return db.scalar(select(Submission).where(Submission.id == sub_uuid))
