import json
import uuid
import os
import redis
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from backend.app.core.config import settings
from backend.app.models.schemas import SubmissionPayload, SubmissionResponse, TestCaseResult, RunPayload, RunResponse
from backend.app.core.sandbox import SandboxExecutor

router = APIRouter()

# Initialize Redis connection
r = redis.from_url(settings.REDIS_URL)

def load_problems():
    try:
        with open(settings.PROBLEMS_JSON_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load problems: {e}")

@router.get("/problems")
def get_problems():
    problems = load_problems()
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "difficulty": p.get("difficulty", "Medium"),
            "tags": p.get("tags", []),
            "description": p["description"],
            "time_limit": p["time_limit"],
            "memory_limit": p["memory_limit"]
        }
        for p in problems
    ]

@router.get("/problems/{id}")
def get_problem(id: str):
    problems = load_problems()
    for p in problems:
        if p["id"] == id:
            # Use sample_cases from JSON directly (with explanations)
            # Fall back to reading from filesystem if not in JSON
            sample_cases = p.get("sample_cases", [])
            if not sample_cases:
                sample_dir = os.path.join(settings.PROBLEMS_DIR, id, "tests", "1")
                if os.path.exists(sample_dir):
                    try:
                        with open(os.path.join(sample_dir, "input.txt"), "r") as f:
                            inp = f.read().strip()
                        with open(os.path.join(sample_dir, "expected_output.txt"), "r") as f:
                            out = f.read().strip()
                        sample_cases.append({"input": inp, "output": out})
                    except Exception:
                        pass

            return {
                "id": p["id"],
                "title": p["title"],
                "difficulty": p.get("difficulty", "Medium"),
                "tags": p.get("tags", []),
                "description": p["description"],
                "constraints": p.get("constraints", []),
                "time_limit": p["time_limit"],
                "memory_limit": p["memory_limit"],
                "sample_cases": sample_cases
            }
    raise HTTPException(status_code=404, detail="Problem not found")

@router.post("/run", response_model=RunResponse)
def run_code(payload: RunPayload):
    """Run code against custom user-supplied stdin. No test-case comparison."""
    lang = payload.language.lower().strip()
    if lang not in ["cpp", "python"]:
        raise HTTPException(status_code=400, detail="Unsupported language")

    sandbox = SandboxExecutor(
        problem_id="__custom_run__",
        language=lang,
        source_code=payload.source_code,
        time_limit=10.0,
        memory_limit_mb=256
    )

    try:
        # Compile if needed
        compiled = sandbox.compile()
        if not compiled:
            sandbox.cleanup()
            return RunResponse(
                verdict="CE",
                time_ms=0,
                compile_error=sandbox.compile_error_msg
            )

        # Run with custom stdin — we reuse run_test_case but ignore expected_output diffing
        result = sandbox.run_test_case(
            input_data=payload.stdin,
            expected_output="__IGNORE__"  # won't match — we only want stdout/stderr
        )

        verdict = "OK" if result["verdict"] in ("AC", "WA") else result["verdict"]
        return RunResponse(
            stdout=result.get("stdout", ""),
            stderr=result.get("error_message", ""),
            verdict=verdict,
            time_ms=result.get("time_ms", 0)
        )
    finally:
        sandbox.cleanup()


@router.post("/submit")
def submit_code(payload: SubmissionPayload):
    # Verify language
    lang = payload.language.lower().strip()
    if lang not in ["cpp", "python"]:
        raise HTTPException(status_code=400, detail="Unsupported language. Only 'cpp' and 'python' are allowed.")

    # Verify problem exists
    problems = load_problems()
    problem_ids = [p["id"] for p in problems]
    if payload.problem_id not in problem_ids:
        raise HTTPException(status_code=404, detail="Problem not found.")

    # Generate submission ID
    submission_id = str(uuid.uuid4())

    # Set initial state in Redis cache
    state = {
        "submission_id": submission_id,
        "problem_id": payload.problem_id,
        "language": lang,
        "status": "QUEUED",
        "verdict": None,
        "error_message": None,
        "test_cases": []
    }
    r.set(f"submission:{submission_id}", json.dumps(state))

    # Push submission payload to queue
    job_payload = {
        "submission_id": submission_id,
        "problem_id": payload.problem_id,
        "language": lang,
        "source_code": payload.source_code
    }
    r.rpush(settings.SUBMISSION_QUEUE_NAME, json.dumps(job_payload))

    return {"submission_id": submission_id, "status": "QUEUED"}

@router.get("/submission/{id}", response_model=SubmissionResponse)
def get_submission_status(id: str):
    data = r.get(f"submission:{id}")
    if not data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return json.loads(data.decode("utf-8"))

# Standard imports needed for path handling
import os
