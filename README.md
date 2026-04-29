<h1 align="center">🌱 CarbonTwin</h1>
<p align="center"><strong>Turn invisible digital emissions into visible ₹ savings.</strong></p>

<p align="center">
  <a href="https://carbontwin.vercel.app"><img src="https://img.shields.io/badge/demo-live-10b981?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://carbontwin.onrender.com/health"><img src="https://img.shields.io/badge/api-live-4f46e5?style=for-the-badge&logo=render&logoColor=white" /></a>
  <a href="https://github.com/AdityaPandey03/carbontwin/actions"><img src="https://img.shields.io/github/actions/workflow/status/AdityaPandey03/carbontwin/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI" /></a>
  <img src="https://img.shields.io/badge/license-MIT-262626?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-2-22d3ee" />
  <img src="https://img.shields.io/badge/Three.js-r170-000000?logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" />
</p>

---

## 🎯 What it is

Every email, AI query, video call and streaming hour has a real-world carbon cost that's normally invisible. CarbonTwin instruments that footprint and turns it into something a person — or a whole company — can act on:

|  |  |
|---|---|
| 📊 **Track** | Every digital activity → kg CO₂ → ₹ social cost via a calibrated carbon engine |
| 🔐 **Auth** | Real signup / login with JWT + bcrypt; 6 seeded demo accounts share the password `demo1234` |
| 🚦 **Budget** | Daily / weekly thresholds with 4-tier status (Safe ✅ / Warning ⚠️ / Critical 🔴 / Exceeded 🚨) |
| 🚨 **Alert** | Real-time alerts on threshold breach + anomaly-based usage spike detection |
| 🤖 **Coach** | Pattern-based AI recommendations, ranked by priority + confidence, with explainable rationale |
| 🏆 **Gamify** | Eco-Score (0–100), 3-tier levels, carbon streaks, badges (3/7/30 day), live leaderboard |
| 🧪 **Simulate** | What-if sandbox — drop streaming quality 25%, audio-only meetings → projected weekly + annualised savings |
| 🏢 **Aggregate** | Team / company view: top contributors, worst offenders, average eco-score |
| 💬 **Chat** | Aggressive AI Eco-Coach with live access to your real metrics |

---

## 🖼️ Live demo

| | |
|---|---|
| 🌐 **Frontend** | [carbontwin.vercel.app](https://carbontwin.vercel.app) |
| 🔌 **API** | [carbontwin.onrender.com](https://carbontwin.onrender.com/health) |
| 📦 **Repo** | [AdityaPandey03/carbontwin](https://github.com/AdityaPandey03/carbontwin) |

> ⚠️ Render's free tier sleeps after 15 min of inactivity → first request after a long idle takes ~30 s to wake the API. Refresh once and it's instant.

---

## 🏗️ Architecture

```
                ┌─────────────────────────────┐
                │  Vite + React + Tailwind    │
                │  Landing · Dashboard · Chat │
                └──────────────┬──────────────┘
                               │ fetch (REST/JSON, mock fallback)
                               │ src/services/mockApi.ts
                               ▼
                ┌─────────────────────────────┐
                │  Express + TypeScript       │
                │  ─────────────────────────  │
                │  /api/dashboard             │
                │  /api/threshold  /alerts    │
                │  /api/activities  /export   │
                │  /api/analytics/weekly      │
                │  /api/recommendations       │
                │  /api/simulate              │
                │  /api/leaderboard /team     │
                │  /api/chat (eco-coach)      │
                │                             │
                │  Rate-limited · CORS · Logs │
                └──────────────┬──────────────┘
                               │ Mongoose
                               ▼
                ┌─────────────────────────────┐
                │  MongoDB (Atlas / memory /  │
                │  local Docker)              │
                └─────────────────────────────┘
```

```
carbontwin/
├── backend/                  Node + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── models/           User · Activity · Threshold · Alert · Streak
│   │   ├── services/         carbonEngine · ecoScore · aiEngine · thresholdService · streakService · chatService
│   │   ├── controllers/      one per route surface
│   │   ├── routes/           REST API
│   │   ├── scripts/          idempotent demo seeder
│   │   └── server.ts         bootstrap (rate-limit · CORS · morgan)
│   ├── Dockerfile
│   └── vitest.config.ts
├── frontend/                 Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/            LandingPage · DashboardPage
│   │   ├── components/
│   │   │   ├── dashboard/    MetricsCards · ImpactChart · EcoScoreGauge ·
│   │   │   │                 ThresholdMeter · AlertsPanel · LogActivity ·
│   │   │   │                 Heatmap · StreakCard · WhatIfSimulator ·
│   │   │   │                 ActionCenter · Leaderboard · Chatbot · Sidebar
│   │   │   ├── landing/      Hero · Features · Stats · CTA · Navbar · Footer
│   │   │   └── ui/           shadcn-style primitives
│   │   ├── services/         mockApi.ts (real API + mock fallback)
│   │   └── ...
├── docker-compose.yml        Mongo + backend, one command
└── .github/workflows/ci.yml  typecheck + test + build on every push
```

---

## 🚀 Local setup

### Option A — Zero dependencies (in-memory MongoDB)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev      # http://localhost:4000

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev      # http://localhost:5173
```

The backend default `USE_MEMORY_DB=true` spins up an in-memory MongoDB and **auto-seeds 6 demo users with 14 days of realistic activity**. No Atlas, no local Mongo install, nothing.

### Option B — Docker compose (real Mongo)

```bash
docker compose up
# backend on :4000, mongo on :27017, both wired up
```

### Option C — MongoDB Atlas

Set `USE_MEMORY_DB=false` and `MONGO_URI=<your-atlas-connection-string>` in `backend/.env`.

---

## ⚙️ Environment

### `backend/.env`
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/carbon_twin
USE_MEMORY_DB=true
JWT_SECRET=change-me-in-production
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env.local`
```
VITE_API_URL=http://localhost:4000
```

---

## 🔌 API reference

```
GET    /health                            health probe

# Auth
POST   /api/auth/signup                   { name, email, password, company? }
POST   /api/auth/login                    { email, password }
GET    /api/auth/me                       requires Authorization: Bearer <jwt>

# Users
GET    /api/users                         list seeded users
POST   /api/users                         { name, email, company }
GET    /api/users/:id

# Activity tracking
POST   /api/activities                    { userId, type, usage, timestamp? }
GET    /api/activities/:userId?limit=
GET    /api/export/:userId/csv            CSV download of all activities

# Threshold + alerts
GET    /api/threshold/:userId             current limits + status
POST   /api/threshold                     { userId, dailyLimit, weeklyLimit }
GET    /api/alerts/:userId                live alert feed (warning / critical / spike)
PATCH  /api/alerts/:id/read

# Roll-ups
GET    /api/dashboard/:userId             everything the dashboard needs
GET    /api/analytics/weekly/:userId      week-over-week % change + breakdown
GET    /api/recommendations/:userId       AI pattern-based suggestions

# Simulator + gamification
POST   /api/simulate                      { userId, changes:[{type,reductionPercent}] }
GET    /api/leaderboard
GET    /api/team/:company                 top contributors + worst offenders

# Eco-Coach chat
POST   /api/chat                          { userId, message }
```

Activity `type` ∈ `ai_query | email | streaming | video_call | cloud_storage | web_browsing | compute | other`.

---

## 🧠 How the engine works

### Carbon

`Carbon (kg CO₂) = usage × baseEnergy[type] (kWh) × 1.2 (overhead) × 0.71 (kg CO₂ / kWh, India grid)`

| Activity | baseEnergy | Unit |
|---|---|---|
| `ai_query` | 0.0029 kWh | per query |
| `email` | 0.000017 kWh | per email |
| `streaming` | 0.077 kWh | per hour |
| `video_call` | 0.157 kWh | per hour |
| `cloud_storage` | 0.001 kWh | per GB-day |
| `web_browsing` | 0.0006 kWh | per page view |
| `compute` | 0.5 kWh | per hour |

Cost: `carbon × ₹850/kg` (social cost of carbon, India weighted).

### Threshold + alerts

On every activity write *and* every dashboard / alert read, the threshold service evaluates rules:
- ≥75% daily → ⚠️ warning
- ≥90% daily, ≥85% weekly → 🔴 critical
- Today vs 7-day-average ratio > 1.8× → 🚀 spike

Alerts are de-duplicated within a 6-hour window so you don't get spammed.

### Eco-Score (0–100)

```
60% threshold compliance
25% improvement vs prior week
15% absolute baseline (rewards low usage)
```

Levels:
- 🌱 **80–100** Green Champion
- 🌿 **50–79** Eco Contributor
- 🔴 **<50** Needs Improvement

### AI recommendations

Pure rule-based pattern matching over the last 14 days — fast, deterministic, *explainable*. Detects:
- Late-night AI usage (≥3 queries between 22:00–05:00)
- Weekday email volume (≥20)
- Streaming-heavy footprint (>30% of total)
- Heavy video-call hours
- Peak-hour clustering
- Cold cloud storage

Each suggestion is scored by **priority** (0–100) and **confidence** (0–1).

### Streaks

Walks back day-by-day from today, counting consecutive days under the daily limit. Awards badges at 3, 7, and 30 days.

---

## 🧪 Tests + CI

```bash
cd backend
npm test            # vitest run — 19 unit tests across carbon, eco-score, AI engine
npm run typecheck   # tsc --noEmit
```

GitHub Actions runs typecheck → tests → build on both backend and frontend on every push to `main`.

---

## 🚢 Deployment

### Backend → Render
1. New Web Service · Node 20 · Root `backend`
2. Build: `npm install && npm run build` · Start: `npm start`
3. Env: `MONGO_URI` (Atlas) · `USE_MEMORY_DB=false` · `CORS_ORIGIN=<frontend-url>`

### Frontend → Vercel
1. Import repo · Root `frontend` · Framework Vite (auto)
2. Env: `VITE_API_URL=<render-backend-url>`

### Database → MongoDB Atlas (free M0)
Create cluster → Database User → Network Access (`0.0.0.0/0` for Render) → copy connection string into `MONGO_URI`.

---

## 🎬 90-second demo script

1. **Landing page** — animated 3D globe, gradient hero, scroll through Features / Stats / CTA.
2. **Enter Dashboard** — the metric cards show real total CO₂ + ₹, 4 KPIs from `/api/dashboard`.
3. **Threshold Meter** — daily + weekly progress bars, colour-shift through Safe → Warning → Critical → Exceeded as you log more activity.
4. **Streak card** — 14-day streak for the demo Green Champion user, badges visible.
5. **Impact Chart** — 14 days of seeded daily emissions plotted with cost overlay.
6. **AlertsPanel** — live feed pulled from `/api/alerts`, refreshes every 20 s.
7. **Log Activity** — pick streaming, 2 hours, click Log → toast confirms CO₂ + ₹ → metrics refresh on next pull → may trigger a new alert.
8. **Heatmap** — hourly carbon distribution across 24h, last 14 days. Spot late-night patterns.
9. **What-If Simulator** — drag video quality / AC temp / open tabs sliders → projected savings update live.
10. **AI Coach Suggestions** — recommendations from `/api/recommendations` with priority + confidence pills, accept / dismiss.
11. **Leaderboard** — all 6 seeded users across 2 companies, with score-bumping animation every 5 s.
12. **Chatbot** — bottom-right; ask "why is my score dropping?" → response uses live threshold + activity data.

---

## 📐 Design decisions

- **Carbon factors** are illustrative and order-of-magnitude correct, not audit-grade. Calibration sources in [`backend/src/services/carbonEngine.ts`](backend/src/services/carbonEngine.ts).
- **AI is rule-based, not LLM-based.** Faster, cheaper, deterministic, explainable — the right call for a behavioural-nudge engine.
- **Mock fallback in mockApi.ts** keeps the UI working even when the backend is down or sleeping. Demo never breaks.
- **In-memory MongoDB** lets a reviewer clone, `npm install`, `npm run dev`, and have a fully seeded demo in 60 seconds.
- **shadcn-style UI primitives** (`components/ui/*`) for the dashboard; landing page uses pure Tailwind + Framer Motion + Three.js globe.

---

## 📜 License

MIT. PRs welcome.

---

🤖 Built with [Claude Code](https://claude.com/claude-code).
