# 🚀 Local Setup & Running Guide

> This guide covers how to clone, configure, and run ApexJudge locally.
> The frontend deploys to Vercel; the backend runs locally and is exposed via Cloudflare Tunnel.

---

## Prerequisites

- macOS with [Homebrew](https://brew.sh)
- Python 3.11+
- Node.js 18+
- Docker Desktop (running)
- `cloudflared` CLI: `brew install cloudflared`

---

## Step 1 — Clone & Install

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

## Step 2 — Configure Backend Environment

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

## Step 3 — Run Database Migrations

```bash
source backend/venv/bin/activate
alembic upgrade head
```

---

## Step 4 — Start Docker Desktop

Open **Docker Desktop** from your Applications folder. Wait until the whale icon in the menu bar stops animating.

> **To stop Docker later:** Click the whale icon → **Quit Docker Desktop** or press `Cmd+Q`.
> Docker will stop all running containers. Your data is safe — the database is in Supabase cloud.

---

## Step 5 — Start the Backend Server

From the **repo root** (not inside `backend/`):

```bash
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Verify it's working:
```bash
curl http://localhost:8000/
# → {"status":"ok","message":"ApexJudge Backend API running."}
```

---

## Step 6 — Start the Cloudflare Tunnel

Open a **second terminal** and run:

```bash
cloudflared tunnel --url http://localhost:8000
```

You'll see:
```
Your quick Tunnel has been created! Visit it at:
https://abc-xyz-example.trycloudflare.com
```

**Copy that URL** — it changes every time you restart the tunnel.

---

## Step 7 — Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment Variables**
2. Update these variables:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://abc-xyz-example.trycloudflare.com` |
   | `VITE_SUPABASE_URL` | `https://[project-ref].supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

3. Go to **Deployments** → click the three-dot menu on the latest deployment → **Redeploy**

> ⚠️ You need to **redeploy on Vercel every time the tunnel URL changes**.

---

## Daily Workflow (Reopening After a Break)

```bash
# 1. Open Docker Desktop — wait for whale icon to stop animating

# 2. Start backend (from repo root)
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# 3. Start tunnel (second terminal)
cloudflared tunnel --url http://localhost:8000
# Copy the new tunnel URL

# 4. Update VITE_API_URL in Vercel → Redeploy

# 5. Visit your live URL
```

---

## Stopping Everything

| Component | How to Stop |
|-----------|-------------|
| **Backend** (`uvicorn`) | `Ctrl+C` in its terminal |
| **Cloudflare Tunnel** | `Ctrl+C` in its terminal |
| **Docker Desktop** | Menu bar whale → **Quit Docker Desktop** |

> Stopping Docker also stops all running sandbox containers. The Supabase database is unaffected.
