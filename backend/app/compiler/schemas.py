from pydantic import BaseModel
from typing import Optional

class CompilerRunRequest(BaseModel):
    language: str
    source_code: str
    stdin: str = ""

class CompilerRunResponse(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    verdict: str  # OK, RE, TLE, MLE, CE
    time_ms: int
    compile_error: Optional[str] = None
