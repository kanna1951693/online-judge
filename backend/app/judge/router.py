from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.judge.schemas import (
    ProblemListResponse, ProblemDetailResponse,
    CustomRunPayload, CustomRunResponse,
    SubmissionPayload, SubmissionResponse
)
from backend.app.judge import service
from backend.app.judge.stubs import generate_stubs
from backend.app.core.sandbox import SandboxExecutor
from backend.app.db.models import ProblemMode, Verdict, User, Submission
from backend.app.core.security import get_optional_current_user

router = APIRouter()

@router.get("/problems", response_model=List[ProblemListResponse])
def get_problems(
    program: str = None,
    tag: str = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    problems = service.get_problems(db, program=program, tag=tag)
    
    user_status = {}
    if user:
        sub_records = db.execute(
            select(Submission.problem_id, Submission.verdict)
            .where(Submission.user_id == user.id)
        ).all()
        for pid, verdict in sub_records:
            if verdict == Verdict.AC:
                user_status[pid] = "solved"
            elif user_status.get(pid) != "solved":
                user_status[pid] = "attempted"
                
    res = []
    for prob in problems:
        status = user_status.get(prob.id) if user else None
        res.append({
            "id": prob.id,
            "slug": prob.slug,
            "title": prob.title,
            "difficulty": prob.difficulty,
            "tags": prob.tags,
            "programs": prob.programs,
            "mode": prob.mode,
            "time_limit_ms": prob.time_limit_ms,
            "memory_limit_kb": prob.memory_limit_kb,
            "status": status
        })
    return res

@router.get("/problems/tags", response_model=List[str])
def get_problems_tags(db: Session = Depends(get_db)):
    return service.get_all_tags(db)

@router.get("/problems/{slug}", response_model=ProblemDetailResponse)
def get_problem(slug: str, db: Session = Depends(get_db)):
    prob = service.get_problem_by_slug(db, slug)
    if not prob:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Filter sample cases
    sample_cases = [tc for tc in prob.test_cases if tc.is_sample]
    
    # Generate user-facing stubs if function signature is present
    stubs = generate_stubs(prob.function_signature) if prob.function_signature else None

    # Construct response
    resp = ProblemDetailResponse(
        id=str(prob.id),
        slug=prob.slug,
        title=prob.title,
        statement=prob.statement,
        difficulty=prob.difficulty,
        programs=prob.programs,
        mode=prob.mode,
        time_limit_ms=prob.time_limit_ms,
        memory_limit_kb=prob.memory_limit_kb,
        sample_cases=sample_cases,
        function_signature=prob.function_signature,
        hints=prob.hints,
        similar_questions=prob.similar_questions,
        stubs=stubs
    )
    return resp

@router.post("/problems/{slug}/run", response_model=CustomRunResponse)
def run_problem_code(slug: str, payload: CustomRunPayload, db: Session = Depends(get_db)):
    prob = service.get_problem_by_slug(db, slug)
    if not prob:
        raise HTTPException(status_code=404, detail="Problem not found")

    lang = payload.language.lower().strip()
    if lang not in ["python", "cpp", "java"]:
        raise HTTPException(status_code=400, detail="Unsupported language")

    # If it is function mode, we will need to wrap it with driver code.
    # We will import the driver registry dynamically or wire it up.
    source_code = payload.source_code
    if prob.mode == ProblemMode.function:
        try:
            from backend.app.judge.drivers import get_driver_generator
            generator = get_driver_generator(lang)
            # We generate the driver wrapper
            source_code = generator.generate(
                user_code=payload.source_code,
                signature=prob.function_signature,
                test_input_json=payload.stdin
            )
        except Exception as e:
            # If drivers aren't implemented/imported yet, fallback to raw code
            pass

    time_limit_sec = prob.time_limit_ms / 1000.0
    memory_limit_mb = max(16, prob.memory_limit_kb // 1024)

    sandbox = SandboxExecutor(
        problem_id=str(prob.id),
        language=lang,
        source_code=source_code,
        time_limit=time_limit_sec,
        memory_limit_mb=memory_limit_mb
    )

    try:
        compiled = sandbox.compile()
        if not compiled:
            return CustomRunResponse(
                verdict="CE",
                time_ms=0,
                compile_error=sandbox.compile_error_msg or "Compilation failed"
            )

        res = sandbox.run_test_case(input_data=payload.stdin, expected_output="__IGNORE__")
        
        verdict = res["verdict"]
        if verdict == "AC":
            verdict = "OK"

        return CustomRunResponse(
            stdout=res.get("stdout", ""),
            stderr=res.get("error_message", ""),
            verdict=verdict,
            time_ms=res.get("time_ms", 0)
        )
    finally:
        sandbox.cleanup()

@router.post("/problems/{slug}/submit")
def submit_problem_code(
    slug: str,
    payload: SubmissionPayload,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    prob = service.get_problem_by_slug(db, slug)
    if not prob:
        raise HTTPException(status_code=404, detail="Problem not found")

    try:
        sub = service.create_submission(
            db=db,
            problem_id=str(prob.id),
            language=payload.language,
            source_code=payload.source_code,
            user_id=str(user.id) if user else None
        )
        return {"submission_id": str(sub.id), "status": "QUEUED"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/submissions/{id}", response_model=SubmissionResponse)
def get_submission_status(id: str, db: Session = Depends(get_db)):
    sub = service.get_submission(db, id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Map status based on verdict and results
    if sub.verdict == Verdict.PENDING:
        status = "RUNNING" if len(sub.results) > 0 else "QUEUED"
    else:
        status = "COMPLETED"

    # Map results
    test_cases_resp = []
    for r in sub.results:
        test_cases_resp.append({
            "id": str(r.id),
            "passed": r.passed,
            "actual_output": r.actual_output,
            "runtime_ms": r.runtime_ms,
            "memory_kb": r.memory_kb,
            "error_message": r.error_message
        })

    return SubmissionResponse(
        submission_id=str(sub.id),
        problem_id=str(sub.problem_id),
        language=sub.language,
        status=status,
        verdict=sub.verdict,
        submitted_at=sub.submitted_at,
        test_cases=test_cases_resp
    )
