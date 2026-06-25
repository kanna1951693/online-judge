import json
import uuid
import os
import redis
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.db.models import Problem, TestCase, FunctionSignature, ProblemMode
from backend.app.models.schemas import (
    SubmissionPayload, SubmissionResponse, TestCaseResult,
    RunPayload, RunResponse
)
from backend.app.core.sandbox import SandboxExecutor
from backend.app.judge.stubs import generate_stubs

router = APIRouter()

# Initialize Redis connection
r = redis.from_url(settings.REDIS_URL)


def load_problems():
    """Fallback: load problems list from problems.json (for legacy routes)."""
    try:
        with open(settings.PROBLEMS_JSON_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load problems: {e}")


@router.get("/problems")
def get_problems(db: Session = Depends(get_db)):
    """Return all problems from the database."""
    problems = db.query(Problem).order_by(Problem.id).all()
    result = []
    for p in problems:
        result.append({
            "id": p.slug,
            "title": p.title,
            "difficulty": p.difficulty.value.capitalize(),
            "tags": p.tags or [],
            "description": p.statement,
            "time_limit": p.time_limit_ms / 1000.0,
            "memory_limit": p.memory_limit_kb / 1024.0,
        })
    return result


@router.get("/problems/{problem_id}")
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    """Return a single problem with stubs and sample test cases from the database."""
    problem = db.query(Problem).filter(Problem.slug == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Generate stubs from function signature
    sig = db.query(FunctionSignature).filter(
        FunctionSignature.problem_id == problem.id
    ).first()

    stubs = {}
    function_signature = None
    if sig:
        stubs = generate_stubs(sig)
        function_signature = {
            "function_name": sig.function_name,
            "params": sig.params,
            "return_type": sig.return_type,
        }

    # Sample test cases (display_order <= 2 or is_sample=True)
    sample_tcs = (
        db.query(TestCase)
        .filter(TestCase.problem_id == problem.id, TestCase.is_sample == True)
        .order_by(TestCase.display_order)
        .all()
    )

    # Try to read human-readable sample cases from problems.json as fallback
    # (preserving any explanation field stored in JSON)
    raw_sample_cases = []
    try:
        with open(settings.PROBLEMS_JSON_PATH, "r") as f:
            all_problems = json.load(f)
        for pdata in all_problems:
            if pdata["id"] == problem_id:
                raw_sample_cases = pdata.get("sample_cases", [])
                break
    except Exception:
        pass

    # Use DB sample cases, falling back to raw JSON sample cases
    if sample_tcs:
        # Parse the stored JSON-encoded input back to a display-friendly format
        formatted_cases = []
        for tc in sample_tcs:
            try:
                inp_obj = json.loads(tc.input)
                # For display: if single-value dict, show the value; otherwise pretty-print
                if isinstance(inp_obj, dict) and len(inp_obj) == 1:
                    display_input = list(inp_obj.values())[0]
                else:
                    display_input = inp_obj
            except Exception:
                display_input = tc.input

            try:
                out_obj = json.loads(tc.expected_output)
                display_output = out_obj
            except Exception:
                display_output = tc.expected_output

            formatted_cases.append({
                "input": display_input,
                "output": display_output,
            })
        sample_cases = formatted_cases
    else:
        sample_cases = raw_sample_cases

    # Load constraints and other metadata from problems.json
    constraints = []
    programs = problem.programs or []
    hints = problem.hints or []
    similar_questions = problem.similar_questions or []
    try:
        with open(settings.PROBLEMS_JSON_PATH, "r") as f:
            all_problems = json.load(f)
        for pdata in all_problems:
            if pdata["id"] == problem_id:
                constraints = pdata.get("constraints", [])
                programs = pdata.get("programs", programs)
                hints = pdata.get("hints", hints)
                similar_questions = pdata.get("similar_questions", similar_questions)
                break
    except Exception:
        pass

    return {
        "id": problem.slug,
        "title": problem.title,
        "difficulty": problem.difficulty.value.capitalize(),
        "tags": problem.tags or [],
        "description": problem.statement,
        "constraints": constraints,
        "time_limit": problem.time_limit_ms / 1000.0,
        "memory_limit": problem.memory_limit_kb / 1024.0,
        "sample_cases": sample_cases,
        "mode": problem.mode.value if problem.mode else "stdin",
        "stubs": stubs,
        "function_signature": function_signature,
        "programs": programs,
        "hints": hints,
        "similar_questions": similar_questions,
    }


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
        compiled = sandbox.compile()
        if not compiled:
            sandbox.cleanup()
            return RunResponse(
                verdict="CE",
                time_ms=0,
                compile_error=sandbox.compile_error_msg
            )

        result = sandbox.run_test_case(
            input_data=payload.stdin,
            expected_output="__IGNORE__"
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
def submit_code(payload: SubmissionPayload, db: Session = Depends(get_db)):
    lang = payload.language.lower().strip()
    if lang not in ["cpp", "python", "java"]:
        raise HTTPException(status_code=400, detail="Unsupported language.")

    problem = db.query(Problem).filter(Problem.slug == payload.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found.")

    submission_id = str(uuid.uuid4())

    from backend.app.db.models import Submission, Language, Verdict
    try:
        lang_enum = Language[lang]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")

    submission = Submission(
        id=uuid.UUID(submission_id),
        problem_id=problem.id,
        language=lang_enum,
        source_code=payload.source_code,
        verdict=Verdict.PENDING
    )
    db.add(submission)
    db.commit()

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
