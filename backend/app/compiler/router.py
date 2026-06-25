from fastapi import APIRouter, HTTPException
from backend.app.compiler.schemas import CompilerRunRequest, CompilerRunResponse
from backend.app.core.sandbox import SandboxExecutor
from backend.app.core.config import settings

router = APIRouter()

@router.post("/run", response_model=CompilerRunResponse)
def run_compiler(payload: CompilerRunRequest):
    lang = payload.language.lower().strip()
    if lang not in ["python", "cpp", "java"]:
        raise HTTPException(status_code=400, detail="Unsupported language. Supported: python, cpp, java.")

    sandbox = SandboxExecutor(
        problem_id="__compiler_run__",
        language=lang,
        source_code=payload.source_code,
        time_limit=settings.COMPILER_TIME_LIMIT_SEC,
        memory_limit_mb=settings.COMPILER_MEMORY_LIMIT_MB
    )

    try:
        # Compile if needed
        compiled = sandbox.compile()
        if not compiled:
            return CompilerRunResponse(
                verdict="CE",
                time_ms=0,
                stderr=sandbox.compile_error_msg or "Compilation failed",
                compile_error=sandbox.compile_error_msg or "Compilation failed"
            )

        # Run with user stdin
        res = sandbox.run_test_case(input_data=payload.stdin, expected_output="__IGNORE__")
        
        verdict = res["verdict"]
        if verdict == "AC":
            verdict = "OK"
            
        return CompilerRunResponse(
            stdout=res.get("stdout", ""),
            stderr=res.get("error_message", ""),
            verdict=verdict,
            time_ms=res.get("time_ms", 0)
        )
    finally:
        sandbox.cleanup()
