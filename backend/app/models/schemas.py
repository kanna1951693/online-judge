from pydantic import BaseModel
from typing import List, Optional

class SubmissionPayload(BaseModel):
    problem_id: str
    language: str
    source_code: str

class TestCaseResult(BaseModel):
    case_id: int
    verdict: str  # AC, WA, TLE, MLE, RE
    time_ms: int
    memory_kb: int
    stdout: Optional[str] = None
    expected_output: Optional[str] = None
    error_message: Optional[str] = None

class SubmissionResponse(BaseModel):
    submission_id: str
    problem_id: str
    language: str
    status: str  # QUEUED, RUNNING, COMPLETED, FAILED
    verdict: Optional[str] = None  # AC, WA, TLE, MLE, RE, CE (Compile Error)
    error_message: Optional[str] = None
    test_cases: List[TestCaseResult] = []
