# PROGRESS.md

## Current Status
Project verification fully complete. All backend services (API, Postgres, Redis, Docker worker), the compiler module, and frontend workflows (Run, Submit, Compiler) have been fully verified and tested end-to-end for C++, Python, and Java.

---

## What's Done

### Backend Core
- [x] FastAPI skeleton with `/submit`, `/submission/{id}`, `/problems` endpoints
  - **Status: VERIFIED** — verified live via the smoke test suite and endpoint testing.
- [x] Redis queue wired up (submission_queue, worker polls in blocking mode)
  - **Status: VERIFIED** — worker successfully processes queued tasks using Redis.
- [x] Docker worker spins container per submission (C++ and Python both working)
  - **Status: VERIFIED** — fully tested with real submissions in C++, Python, and Java.

### Sandbox Hardening
- [x] Static compilation support for C++ binaries in sandboxed executions
  - **Status: VERIFIED** — tested via both local tests and live runner execution.
- [x] TLE detection — watchdog timeout verified against C++ and Python infinite loops
  - **Status: VERIFIED** — verified correct detection.
- [x] MLE detection — memory limits verified against C++ and Python allocations
  - **Status: VERIFIED** — verified correct detection.
- [x] Fork bomb protection — PID limit blocks process exhaustion
  - **Status: VERIFIED** — verified correct detection.
- [x] Network isolation (`--network none`)
  - **Status: VERIFIED** — verified.
- [x] Read-only rootfs with workspace mounts
  - **Status: VERIFIED** — verified.
- [x] Docker container cleanup (0 leaks after sequential stress tests)
  - **Status: VERIFIED** — verified.

### Frontend & API Workflows
- [x] React Frontend & Monaco Editor integrations
  - **Status: VERIFIED** — verified.
- [x] Standalone Compiler Page & End-to-end API workflows
  - **Status: VERIFIED** — Python, C++, and Java execution (success and compile-error output matching) verified end-to-end.
- [x] End-to-end Submit/Poll/Grading Flow
  - **Status: VERIFIED** — full submissions are created, polled, and updated in Postgres with correct AC/WA/CE verdicts.

### Infrastructure & Documentation
- [x] E2E Docker Compose orchestration for local development
  - **Status: VERIFIED** — stack orchestration verified active and running correctly.
- [x] Documentation (README with sequence diagrams and OS/Colima caveats)
  - **Status: VERIFIED** — file reviewed and complete.

---

## What's In Progress
Nothing. All planned deliverables and tasks are fully executed.

## What's NOT Started
Nothing.

---

## Known Issues / Decisions Made
- **Critical: `DOCKER_HOST` must be set explicitly** — Without `DOCKER_HOST="unix:///Users/kunalb/.colima/default/docker.sock"`, all sandbox tests fail with `ConnectionRefusedError`. This must be set before running the backend or tests. The README covers this.
- **Workspace mounting constraint** — Temporary containers mount directories from `/Users/kunalb/online-judge/backend/temp/submissions` because the `/Users` folder is shared into the Colima VM by default.
- **Robust JSON output matching** — Implemented standard JSON parsing comparison in `sandbox.py`'s validator so spacing variations (e.g. `[0,1]` vs `[0, 1]`) do not trigger false Wrong Answer verdicts.
- **Mac-specific Colima VM driver** — On Apple Silicon, use the `vz` VM driver: `colima start --cpu 2 --memory 4`. Standard `qemu` driver causes architecture/mount issues.
- **Java Import Extraction** — The Java driver extracts all user imports and lifts them to the top of the file to prevent Java compilation errors when importing in the middle of a file.

---

## Verification Summary
All automated and manual smoke tests for the compiler, grader, and database are green.
- **Python**: Run (OK) / Submit (AC) / Syntax Error (RE with trace) -> **PASS**
- **C++**: Run (OK) / Submit (AC) / Compile Error (CE with logs) -> **PASS**
- **Java**: Run (OK) / Submit (AC) / Compile Error (CE with logs) -> **PASS**
- **Database**: Confirmed compiler tests do not populate Postgres submissions or results -> **PASS**
