from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
from backend.app.compiler.router import router as compiler_router
from backend.app.judge.router import router as judge_router
from backend.app.auth.router import router as auth_router
from backend.app.user.router import router as user_router

app = FastAPI(title="ApexJudge API", version="1.0.0")

# CORS configurations for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local build ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the endpoints router
app.include_router(api_router, prefix="/api/v1")
app.include_router(compiler_router, prefix="/api/v1/compiler")
app.include_router(judge_router, prefix="/api/v1/judge")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(user_router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ApexJudge Backend API running."}

