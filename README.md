# ApexJudge: A Sandboxed Online Judge

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://online-judge-owlksiijn-kunal-s-projects26.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://cloudflare.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

**ApexJudge** is a secure, sandboxed online judge that evaluates user-submitted C++, Python, and Java code in real-time. Code is isolated inside Docker containers enforcing strict cgroup resource limits (CPU, memory, PID, network).

🌐 **Live at:** https://online-judge-owlksiijn-kunal-s-projects26.vercel.app/

---

## 🏗️ Deployment Architecture

```
Browser (Vercel CDN)
        │
        │  HTTPS (Cloudflare Tunnel URL — set as VITE_API_URL in Vercel)
        ▼
FastAPI Backend (localhost:8000)   ←── Cloudflared tunnel exposes this
        │                                to the public internet
        ├── Supabase Postgres (cloud DB, 34+ problems seeded)
        ├── Docker Engine (sandboxed code execution)
        └── Google OAuth via Supabase Auth
```

- **Frontend**: React + Vite, deployed on **Vercel**
- **Backend**: FastAPI, runs **locally** and exposed via **Cloudflare Tunnel**
- **Database**: **Supabase Postgres** (hosted, always-on)
- **Auth**: **Supabase Google OAuth**
- **Sandboxing**: Local **Docker** containers (must be running)

---

## 🏗️ System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Candidate
    participant FE as React Frontend (Vercel)
    participant CF as Cloudflare Tunnel
    participant BE as FastAPI Backend (local)
    participant DB as Supabase Postgres
    participant DK as Docker Sandbox

    User->>FE: Submits code
    FE->>CF: POST /api/v1/judge/problems/{slug}/submit
    CF->>BE: Forwards request (tunnel)
    BE->>DB: Save submission record
    BE-->>FE: { submission_id, status: QUEUED }

    FE->>CF: Poll GET /api/v1/judge/submissions/{id}
    BE->>DK: Spin up isolated container, run test cases
    DK-->>BE: Exit code, stdout, time, memory
    BE->>DB: Store verdict
    BE-->>FE: Verdict (AC / WA / TLE / MLE / RE)
    FE->>User: Color-coded test results
```

---

## 🚀 How to Run (Local Backend + Vercel Frontend)

This project uses a **split deployment**: the frontend is on Vercel, but the backend runs on your local machine and is exposed via a Cloudflare Tunnel.

### Prerequisites

- macOS with [Homebrew](https://brew.sh)
- Python 3.11+
- Node.js 18+
- Docker Desktop (running)
- `cloudflared` CLI: `brew install cloudflared`

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/kanna1951693/online-judge.git
cd online-judge

# Backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2 — Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your real values:

```env
# Supabase Postgres connection string (Session pooler, port 5432)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Supabase project credentials
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

---

### Step 3 — Start Docker Desktop

Open **Docker Desktop** from your Applications folder. Wait until the whale icon in the menu bar stops animating (it's ready).

> **To stop Docker later:** Click the whale icon in the menu bar → **Quit Docker Desktop**, or press `Cmd+Q` while Docker Desktop is in focus.
> Docker will stop all running containers. Your data is safe — the database is in Supabase cloud, not in Docker.

---

### Step 4 — Start the Backend Server

From the **repo root** (not inside `backend/`):

```bash
cd /path/to/online-judge
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Verify it's working:
```bash
curl http://localhost:8000/
# → {"status":"ok","message":"ApexJudge Backend API running."}
```

---

### Step 5 — Start the Cloudflare Tunnel

Open a **second terminal** and run:

```bash
cloudflared tunnel --url http://localhost:8000
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://abc-xyz-example.trycloudflare.com
```

**Copy that URL** — it changes every time you restart the tunnel.

---

### Step 6 — Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment Variables**
2. Update (or create) these variables:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://abc-xyz-example.trycloudflare.com` ← your tunnel URL |
   | `VITE_SUPABASE_URL` | `https://[project-ref].supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

3. Go to **Deployments** → click the three-dot menu on the latest deployment → **Redeploy**

> ⚠️ You need to **redeploy on Vercel every time the tunnel URL changes** (i.e., every time you restart `cloudflared`).

---

### Step 7 — Done! Test the full flow

Visit the live URL and verify:

- [ ] Problem list loads (34+ problems)
- [ ] Click a problem → workspace opens
- [ ] Google login works (via Supabase Auth)
- [ ] Run code → output appears
- [ ] Submit → verdict (AC / WA / TLE) shown
- [ ] Standalone Compiler page works

---

## 🔄 Daily Workflow (Reopening After a Break)

```bash
# 1. Open Docker Desktop (from Applications or Spotlight)
#    Wait for the whale icon to stop animating

# 2. Start the backend (from repo root)
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# 3. Start the tunnel (in a separate terminal)
cloudflared tunnel --url http://localhost:8000
# Copy the new tunnel URL (it changes every restart)

# 4. Update VITE_API_URL in Vercel dashboard with the new URL
#    Then: Vercel → Deployments → Redeploy

# 5. Visit https://online-judge-owlksiijn-kunal-s-projects26.vercel.app/
```

---

## 🛑 Stopping Everything

| Component | How to Stop |
|-----------|-------------|
| **Backend** (`uvicorn`) | Press `Ctrl+C` in its terminal |
| **Cloudflare Tunnel** | Press `Ctrl+C` in its terminal |
| **Docker Desktop** | Menu bar whale icon → **Quit Docker Desktop** (or `Cmd+Q`) |

> Stopping Docker also stops all running sandbox containers. The Supabase cloud database is unaffected.

---

## 🔒 Security & Sandboxing

Every code submission runs inside a **disposable Docker container** with:

| Limit | Value | Enforced By |
|-------|-------|-------------|
| Memory | 256 MB | `docker -m 256m` |
| CPU | 0.5 cores | `docker --cpus=0.5` |
| Process/fork limit | 64 PIDs | `docker --pids-limit=64` |
| Network access | None | `docker --network none` |
| Filesystem | Read-only | `docker --read-only` |
| Wall-clock timeout | Per-problem (default 2s) | Host watchdog thread |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Monaco Editor |
| Backend | Python 3.11+, FastAPI, SQLAlchemy, Alembic |
| Database | Supabase Postgres (hosted) |
| Auth | Supabase Google OAuth |
| Sandboxing | Docker Engine (`docker-py`) |
| Tunnel | Cloudflare Tunnel (`cloudflared`) |
| Deployment | Vercel (frontend) |

---

## 📡 API Reference

Base URL: `https://[your-tunnel-url].trycloudflare.com`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/judge/problems` | List all problems |
| `GET` | `/api/v1/judge/problems/{slug}` | Problem detail + sample cases |
| `POST` | `/api/v1/judge/problems/{slug}/run` | Run code (custom input, no verdict) |
| `POST` | `/api/v1/judge/problems/{slug}/submit` | Submit for grading |
| `GET` | `/api/v1/judge/submissions/{id}` | Submission verdict + test results |
| `POST` | `/api/v1/compiler/run` | Standalone compiler (any code, no problem) |
| `POST` | `/api/v1/auth/login` | Email/password login |
| `POST` | `/api/v1/auth/register` | Email/password register |
| `POST` | `/api/v1/auth/supabase-login` | Exchange Supabase OAuth token |
| `GET` | `/api/v1/users/profile/{hash}` | User profile + stats |

---

## 🗂️ Project Structure

```
online-judge/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── core/            # Config, security, database
│   │   ├── judge/           # Problem listing, submission, verdict
│   │   ├── compiler/        # Standalone compiler endpoint
│   │   ├── auth/            # Login, register, Supabase OAuth sync
│   │   └── user/            # Profile, heatmap, stats
│   ├── problems/            # Problem YAML files (34+ problems)
│   ├── scripts/             # Seed scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.js       # apiUrl() — reads VITE_API_URL
│   │   │   └── supabaseClient.js
│   │   ├── pages/           # ProblemList, ProblemWorkspace, CompilerPage, ProfilePage
│   │   └── components/      # AuthModal, etc.
│   ├── vercel.json          # Vercel SPA rewrite rules
│   └── .env.example         # Template for env vars
├── docker-compose.yml       # Local dev (Postgres + Redis) — optional
└── README.md
```
