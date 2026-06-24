# PROGRESS.md

## Current Status
Day 2 of 2 — Backend sandbox engine is verified. React frontend builds and dev server runs; end-to-end submit/poll flow has not been verified in a live session. One day remains: fix and verify the full frontend flow, then finish documentation.

---

## What's Done

### Backend Core
- [x] FastAPI skeleton with `/submit`, `/submission/{id}`, `/problems` endpoints
  - **Status: ASSUMED** — code exists and looks correct; API server was not started and endpoints were not hit during this session.
- [x] Redis queue wired up (submission_queue, worker polls in blocking mode)
  - **Status: ASSUMED** — Redis was not running during this session; code exists but not executed.
- [x] Docker worker spins container per submission (C++ and Python both working)
  - **Status: VERIFIED** — sandbox unit tests passed (`Ran 10 tests in 6.398s — OK`). Requires `DOCKER_HOST` env var to be set (see Known Issues).

### Sandbox Hardening
- [x] Static compilation support for C++ binaries in sandboxed executions
  - **Status: VERIFIED** — `test_cpp_ac` compiled and ran C++ correctly in the test run.
- [x] TLE detection — watchdog timeout verified against C++ and Python infinite loops
  - **Status: VERIFIED** — `test_python_tle` and `test_cpp_tle` both passed.
- [x] MLE detection — memory limits verified against C++ and Python allocations
  - **Status: VERIFIED** — `test_python_mle` and `test_cpp_mle` both passed.
- [x] Fork bomb protection — PID limit blocks process exhaustion
  - **Status: VERIFIED** — `test_python_fork_bomb` passed.
- [x] Network isolation (`--network none`)
  - **Status: ASSUMED** — flag is present in sandbox code; no dedicated test exists; not verified by observation.
- [x] Read-only rootfs with workspace mounts
  - **Status: ASSUMED** — flag is present in sandbox code; no dedicated test exists; not verified by observation.
- [x] Docker container cleanup (0 leaks after sequential stress tests)
  - **Status: ASSUMED** — no stress test or container-count check was run; no test exists for this.

### Frontend
- [x] React Frontend — Problem list/detail pages, Monaco editor, submit flow, live status polling, verdict breakdown
  - **Status: PARTIALLY VERIFIED** — `npm run build` succeeded (1519 modules, built in 782ms); Vite dev server started on `http://localhost:5174/`. End-to-end submit → poll → verdict flow has NOT been observed in a live session with the backend running.

### Infrastructure & Documentation
- [x] E2E Docker Compose orchestration for local development
  - **Status: ASSUMED** — `docker-compose.yml` exists; `docker compose up` was not run during this session.
- [x] Documentation (README with sequence diagrams and OS/Colima caveats)
  - **Status: VERIFIED** — file reviewed; contains Mermaid sequence diagram, API docs, and macOS/Colima setup instructions.

---

## What's In Progress
- [ ] Frontend end-to-end verification (submit flow, live polling, verdict display) with backend running
- [ ] Documentation finalization (README accuracy, known issues, troubleshooting section)

## What's NOT Started
Nothing outside the above two items. Scope is locked.

---

## Known Issues / Decisions Made
- **Critical: `DOCKER_HOST` must be set explicitly** — Without `DOCKER_HOST="unix:///Users/kunalb/.colima/default/docker.sock"`, all sandbox tests fail with `ConnectionRefusedError`. This must be set before running the backend or tests. The README covers this but it is the most common failure point.
- **Workspace mounting constraint** — Temporary containers mount directories from `/Users/kunalb/online-judge/backend/temp/submissions` because the `/Users` folder is shared into the Colima VM by default.
- **Spaces-sensitive output matching** — Exact output matching strips trailing newlines/spaces, but internal spacing (e.g. `[0, 1]` vs `[0,1]`) will flag as `WA`. Candidates must format output exactly.
- **Mac-specific Colima VM driver** — On Apple Silicon, use the `vz` VM driver: `colima start --cpu 2 --memory 4`. Standard `qemu` driver causes architecture/mount issues.

---

## Tomorrow's Session (Day 3 — Final Day)
Exactly two tasks remain:
1. **Fix and verify the frontend** — start backend + worker + Redis together, open the browser, submit code, confirm the full flow works end-to-end.
2. **Finish documentation** — ensure README is accurate (especially `DOCKER_HOST` setup), add a troubleshooting section for the `ConnectionRefusedError` issue.

No other work is planned or in scope.
