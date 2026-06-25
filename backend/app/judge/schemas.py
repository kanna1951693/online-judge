from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from backend.app.db.models import Difficulty, ProblemMode, Language, Verdict

class TestCaseSampleResponse(BaseModel):
    input: str
    expected_output: str
    is_sample: bool
    display_order: int

    class Config:
        from_attributes = True

class FunctionSignatureParamResponse(BaseModel):
    name: str
    type: str

class FunctionSignatureResponse(BaseModel):
    function_name: str
    params: List[FunctionSignatureParamResponse]
    return_type: str

    class Config:
        from_attributes = True

class ProblemListResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    difficulty: Difficulty
    tags: List[str]
    programs: List[str]
    mode: ProblemMode
    time_limit_ms: int
    memory_limit_kb: int
    status: Optional[str] = None

    class Config:
        from_attributes = True

class ProblemDetailResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    statement: str
    difficulty: Difficulty
    programs: List[str]
    mode: ProblemMode
    time_limit_ms: int
    memory_limit_kb: int
    sample_cases: List[TestCaseSampleResponse]
    function_signature: Optional[FunctionSignatureResponse] = None
    hints: List[str] = []
    similar_questions: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class CustomRunPayload(BaseModel):
    language: str
    source_code: str
    stdin: str = ""

class CustomRunResponse(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    verdict: str  # OK, RE, TLE, MLE, CE
    time_ms: int

class SubmissionPayload(BaseModel):
    language: str
    source_code: str

class TestCaseResultResponse(BaseModel):
    id: uuid.UUID
    passed: bool
    actual_output: Optional[str] = None
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    submission_id: str
    problem_id: str
    language: Language
    status: str  # QUEUED, RUNNING, COMPLETED, FAILED
    verdict: Optional[Verdict] = None
    submitted_at: datetime
    test_cases: List[TestCaseResultResponse] = []

    class Config:
        from_attributes = True
