ApexJudge Deployment Guide
==========================

This guide covers migrating PostgreSQL to Supabase and deploying the
React frontend (Vercel) plus FastAPI backend (Render). No schema changes
are required — existing SQLAlchemy models and Alembic migrations are used
as-is.


PART A — Supabase PostgreSQL Migration
======================================

Why Supabase?
-------------
Supabase provides managed PostgreSQL. ApexJudge continues to use SQLAlchemy
and Alembic directly — no Supabase client queries, no RLS changes.


Step 1: Create a Supabase project
---------------------------------
1. Go to https://supabase.com and sign in (or create an account).
2. Click "New project".
3. Choose an organization, project name (e.g. apexjudge), database password,
   and region close to your users.
4. Wait for the project to finish provisioning (~2 minutes).


Step 2: Get the database connection string
------------------------------------------
1. Open your project in the Supabase dashboard.
2. Go to Project Settings (gear icon) → Database.
3. Under "Connection string", select "URI".
4. Choose "Transaction pooler" (port 6543) for server apps — recommended
   for FastAPI + Alembic.
5. Copy the URI. It looks like:
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
6. Replace [YOUR-PASSWORD] with the database password you set at project creation.


Step 3: Configure DATABASE_URL locally
--------------------------------------
Add the connection string to ONE of these files (first match wins):

  backend/.env
  backend/.env.local
  .env          (project root)
  .env.local    (project root)

Example entry (use your real URI, never commit it):

  DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

The backend auto-normalizes:
  - postgres:// → postgresql+psycopg2://
  - postgresql:// → postgresql+psycopg2://
  - sslmode=require for Supabase hosts


Step 4: Run Alembic migrations against Supabase
-----------------------------------------------
From the project root (/Users/kunalb/online-judge):

  cd /Users/kunalb/online-judge
  export DATABASE_URL='postgresql://postgres.xxxxx:your-password@...pooler.supabase.com:6543/postgres'
  alembic upgrade head

Or, if DATABASE_URL is already in backend/.env:

  cd /Users/kunalb/online-judge
  alembic upgrade head

Expected output ends with lines like:
  INFO  [alembic.runtime.migration] Running upgrade ... -> head


Step 5: Seed problems and test cases
------------------------------------
Seeds all problems from backend/app/problems.json plus filesystem test cases.

  cd /Users/kunalb/online-judge
  PYTHONPATH=. python backend/scripts/seed_problems.py

Expected output: "Seeding completed successfully!"


Step 6: Verify backend connects to Supabase
---------------------------------------------
Start Redis locally (or point REDIS_URL to a hosted Redis):

  redis-server

Start the API:

  cd /Users/kunalb/online-judge
  uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

Fetch the problem list:

  curl http://localhost:8000/api/v1/judge/problems

You should receive a JSON array of problems.


Step 7: Use Supabase with docker-compose (optional)
---------------------------------------------------
To keep Redis + Docker judge locally but use Supabase for Postgres:

1. Add DATABASE_URL to a .env file at the project root (docker-compose reads it).
2. Start only redis + backend + worker (postgres service is unused if DATABASE_URL
   points to Supabase):

  docker compose up redis backend worker

Or export DATABASE_URL before compose up.


PART B — Production Deployment
==============================

Architecture overview
---------------------
  Browser → Vercel (React/Vite static site)
         → Render (FastAPI API + Redis + worker)
         → Supabase (PostgreSQL)

IMPORTANT: Vercel cannot run this backend
-----------------------------------------
The FastAPI backend spawns Docker containers to sandbox user code (Docker-in-Docker
via host socket). Vercel serverless functions cannot mount /var/run/docker.sock
or run long-lived judge workers. Deploy the backend on Render (or a VPS), not Vercel.


Frontend — Vercel
-----------------

Why Vercel?
  Static Vite build, free tier, easy GitHub integration.

Setup steps:
1. Push the repo to GitHub (if not already).
2. Go to https://vercel.com → Add New Project → Import your repo.
3. Set Root Directory to: frontend
4. Framework Preset: Vite (auto-detected)
5. Build Command: npm run build
6. Output Directory: dist
7. Add environment variables (see "Environment variables" section below).
8. Deploy.

After deploy, set VITE_API_URL to your Render backend URL (e.g.
https://apexjudge-api.onrender.com) and redeploy so the frontend calls
the production API.

Local dev: leave VITE_API_URL empty — Vite proxies /api to localhost:8000.


Backend — Render
----------------

Why Render?
  Simple Docker deploy, managed Redis, free tier for portfolio demos.

Setup steps:
1. Go to https://render.com → New → Blueprint.
2. Connect your GitHub repo.
3. Render reads render.yaml and creates:
   - apexjudge-redis (Redis)
   - apexjudge-api (FastAPI web service)
   - apexjudge-worker (grader worker)
4. When prompted, set secret env vars:
   - DATABASE_URL (Supabase URI from Part A)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - JWT_SECRET_KEY (Render can auto-generate for the API service; copy the same
     value to the worker service)
5. Deploy. Migrations run via preDeployCommand: alembic upgrade head.

After deploy, copy the API service URL (e.g. https://apexjudge-api.onrender.com)
into Vercel as VITE_API_URL.

Post-deploy seed (one time):
  Render Dashboard → apexjudge-api → Shell:

  alembic upgrade head
  PYTHONPATH=. python backend/scripts/seed_problems.py


Docker socket limitation (critical)
-----------------------------------
Render, Railway, and Fly.io do NOT provide host Docker socket access on standard
plans. Without the socket, code submission grading and the compiler sandbox will
NOT work in production on these PaaS hosts.

What works on Render without Docker socket:
  - Problem list / problem detail (read from Supabase)
  - Auth (Supabase login + JWT)
  - User profiles

What requires a VPS with Docker:
  - POST /api/v1/judge/problems/{id}/submit
  - POST /api/v1/judge/problems/{id}/run
  - POST /api/v1/compiler/run

For a full demo with working submissions, deploy on a VPS using docker-compose:

  git clone <repo>
  cd online-judge
  # Set DATABASE_URL, SUPABASE_*, JWT_SECRET_KEY in .env
  docker compose up -d

Ensure the VPS has Docker installed and /var/run/docker.sock is available.


Alternative: VPS-only deployment
--------------------------------
For internship portfolio demos with working judge:
  - Frontend: still Vercel (or serve frontend/dist via nginx on VPS)
  - Backend + worker + Redis + Docker: single VPS (DigitalOcean, Hetzner, etc.)
  - Database: Supabase (managed) or local postgres in docker-compose


Environment variables (names only)
==================================

Vercel (frontend)
-------------------
  VITE_API_URL          — Backend base URL (e.g. https://apexjudge-api.onrender.com)
                          Used in: frontend/src/lib/api.js
  VITE_SUPABASE_URL     — Supabase project URL
                          Used in: frontend/src/lib/supabaseClient.js
  VITE_SUPABASE_ANON_KEY — Supabase anon/public key
                          Used in: frontend/src/lib/supabaseClient.js


Render / backend host
---------------------
  DATABASE_URL          — PostgreSQL connection string (Supabase URI)
                          Used in: backend/app/core/config.py, Alembic, seed script
  REDIS_URL             — Redis connection string
                          Used in: backend/app/core/config.py, grader queue
  SUPABASE_URL          — Supabase project URL
                          Used in: backend/app/core/config.py, auth validation
  SUPABASE_ANON_KEY     — Supabase anon key
                          Used in: backend/app/core/config.py, auth validation
  JWT_SECRET_KEY        — Secret for app JWT tokens after login
                          Used in: backend/app/core/config.py, auth router
  PROBLEMS_JSON_PATH    — Path to problems catalog JSON (optional in prod)
  PROBLEMS_DIR          — Path to problem test case files (optional in prod)
  SANDBOX_TEMP_DIR      — Temp dir for submission artifacts
  SANDBOX_LIB_DIR       — Bundled libs for sandbox containers
  HOST_WORKSPACE_PATH   — Host path for Docker volume mounts (VPS only)


Local development (.env)
------------------------
  Same backend vars as above, plus optional frontend .env.local with VITE_* vars.


Quick reference commands
========================

Migrations:
  alembic upgrade head

Seed:
  PYTHONPATH=. python backend/scripts/seed_problems.py

Frontend build (matches Vercel):
  cd frontend && npm install && npm run build
  # Output: frontend/dist

Backend health check:
  curl https://YOUR-API-URL/

Problem list:
  curl https://YOUR-API-URL/api/v1/judge/problems
