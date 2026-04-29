# 🌱 CarbonTwin — Digital Carbon Intelligence Platform

> **Turn invisible emissions into visible savings.** A full-stack AI-powered platform that tracks digital carbon emissions, converts them into ₹ cost, and uses pattern-based AI recommendations + gamification to drive real behavioural change.

![tech](https://img.shields.io/badge/stack-Node%20%7C%20Express%20%7C%20MongoDB%20%7C%20Vite%20%7C%20React%20%7C%20Tailwind-emerald?style=flat-square)
![status](https://img.shields.io/badge/status-demo--ready-success?style=flat-square)

---

## 🎯 What is this?

Every email you send, every AI query you make, every minute of streaming — it all has a real-world carbon cost that is normally invisible. **CarbonTwin** instruments that footprint and turns it into something a person or company can act on:

1. **Track** every digital activity (AI queries, video calls, streaming, cloud storage, email…) and convert usage → kg CO₂ → ₹ social cost via a calibrated carbon engine.
2. **Budget** with daily and weekly carbon thresholds; the system surfaces 4-tier status (Safe ✅ / Warning ⚠️ / Critical 🔴 / Exceeded 🚨) and fires real-time alerts on threshold breach or usage spikes.
3. **Coach** with an AI recommendation engine that detects behavioural patterns (late-night AI usage, weekday email volume, streaming-heavy footprints, peak-hour clustering) and produces ranked, contextual, explainable suggestions — each one tagged with carbon saved/week, ₹ saved/week, confidence, and priority.
4. **Gamify** with an Eco-Score (60% threshold compliance + 25% improvement-vs-prior-week + 15% baseline), 3-tier levels (🌱 Green Champion / 🌿 Eco Contributor / 🔴 Needs Improvement), carbon streaks, badges (3 / 7 / 30-day), and a live company leaderboard.
5. **Simulate** with a What-If sandbox that projects the impact of habit changes (cut AI queries by 30%, drop streaming quality, audio-only meetings) — both weekly and annualised.
6. **Aggregate** at team level: total company emissions, top contributors, worst offenders, average eco-score.

---

## 🏗️ Tech Stack

| Layer | Stack |
|---|---|
| **Backend** | Node.js · Express · TypeScript · MongoDB (Mongoose) · `mongodb-memory-server` for zero-setup demos |
| **Frontend** | Vite · React 18 · TypeScript · Tailwind CSS · Recharts · Framer Motion · Three.js (animated globe) · React Router |
| **APIs** | REST/JSON |

```
carbontwin/
├── backend/          ← Express + Mongoose + TypeScript
│   └── src/
│       ├── models/         User, Activity, Threshold, Alert, Streak
│       ├── services/       carbonEngine, ecoScore, aiEngine, thresholdService, streakService
│       ├── controllers/    one per route
│       ├── routes/         REST API surface
│       └── scripts/        idempotent demo seed
└── frontend/         ← Vite + React + TypeScript + Tailwind
    └── src/
        ├── pages/          LandingPage, DashboardPage
        ├── components/     dashboard/, landing/, ui/ (shadcn-style)
        └── services/       mockApi.ts (real backend client + mock fallback)
```

---

## 🚀 Quick Start

You need **Node.js 18+** and **npm**. MongoDB is **not** required for local dev — the backend runs an in-memory MongoDB by default and auto-seeds 6 demo users with 14 days of realistic activity.

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm run dev
# → API on http://localhost:4000
# → seeds 6 demo users + 14 days of activity automatically on first boot

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:5173 (Vite default)
```

Open **<http://localhost:5173>**, click **Enter Dashboard**, and the UI auto-selects the highest eco-score user from the seeded data. If the backend isn't running, the frontend gracefully falls back to mock data so the UI never breaks.

---

## 🔌 API Reference

```
GET    /health
GET    /api/users
POST   /api/users                       { name, email, company }
GET    /api/users/:id

POST   /api/activities                  { userId, type, usage, timestamp? }
GET    /api/activities/:userId?limit=

GET    /api/threshold/:userId
POST   /api/threshold                   { userId, dailyLimit, weeklyLimit }

GET    /api/alerts/:userId
PATCH  /api/alerts/:id/read

GET    /api/dashboard/:userId           ← rolled-up CO₂, ₹, eco-score, threshold, alerts, trend, heatmap, streak
GET    /api/analytics/weekly/:userId    ← week-over-week % change, daily breakdown, top emission source
GET    /api/recommendations/:userId     ← AI pattern-based suggestions

POST   /api/simulate                    { userId, changes: [{ type, reductionPercent }] }
GET    /api/leaderboard
GET    /api/team/:company               ← top contributors + worst offenders + avg eco-score
```

Activity `type` ∈ `ai_query | email | streaming | video_call | cloud_storage | web_browsing | compute | other`.

---

## 🧠 Architecture

```
                ┌─────────────────────────────┐
                │  Vite + React + Tailwind    │
                │  (landing + dashboard)      │
                └──────────────┬──────────────┘
                               │ fetch (REST/JSON)
                               │ via src/services/mockApi.ts
                               ▼
                ┌─────────────────────────────┐
                │  Express + TypeScript       │
                │  /api/* routes              │
                │  Carbon · Threshold ·       │
                │  Alerts · AI · Streak       │
                └──────────────┬──────────────┘
                               │ Mongoose
                               ▼
                ┌─────────────────────────────┐
                │  MongoDB (real or memory)   │
                └─────────────────────────────┘
```

**Carbon engine.** `Carbon (kg CO₂) = usage × baseEnergy × 1.2 × 0.71`, with `baseEnergy[type]` calibrated to each activity (e.g. 0.0029 kWh/AI-query, 0.077 kWh/streaming-hour). Cost = `carbon × ₹850/kg` (social cost of carbon, India weighted).

**Threshold + alerts.** On every activity write *and* every alert/dashboard read, the threshold service evaluates:
- ≥75% daily → ⚠️ warning
- ≥90% daily / ≥85% weekly → 🔴 critical
- Today vs 7-day-average ratio > 1.8× → 🚀 spike
Alerts are de-duplicated within a 6h window.

**Eco-Score (0–100).** 60% threshold compliance · 25% improvement vs prior week · 15% absolute-baseline. Re-computed live on every dashboard load.

**AI recommendations.** Pure rule-based pattern matching over the last 14 days of activities — fast, deterministic, *explainable*. Detects late-night AI usage, weekday email volume, streaming-heavy footprints, heavy video calls, peak-hour clustering, cold cloud storage. Each suggestion is scored by priority and confidence.

**Streaks.** Walks back day-by-day from today, counting consecutive days under the daily limit; awards badges at 3, 7, and 30 days.

---

## 🎬 Demo Script (90 s)

1. **Landing page** — emerald gradient hero, animated 3D globe, scroll through Features / Stats / CTA / Footer.
2. **Enter Dashboard** — metric cards show real total CO₂ + ₹, eco-score 92 with 🌱 Green Champion level for *Anushka Verma*.
3. The **Impact Chart** plots 14 days of seeded activity; daily threshold meter shows Safe Zone for the current user.
4. **AI Coach Suggestions** are pulled live from `/api/recommendations` — late-night AI alert, batch-emails recommendation, streaming-quality drop, etc.
5. Drag the **What-If Simulator** sliders → projected CO₂ and ₹ savings update in real time.
6. **Leaderboard** shows all 6 seeded users across 2 companies, with live "score-bumping" simulation every 5s; the current user is highlighted.
7. **Chatbot** in the corner — ask "why did my score drop?" for an aggressive eco-coach response.

---

## 🚢 Deployment

### Backend → Render / Railway
1. New Web Service → Node 18+
2. Build: `cd backend && npm install && npm run build`
3. Start: `cd backend && npm start`
4. Env: `MONGO_URI` (MongoDB Atlas free tier), `USE_MEMORY_DB=false`, `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend → Vercel
1. Import the repo, set **Root Directory** = `frontend`
2. Build: `npm run build` · Output: `dist`
3. Env: `VITE_API_URL=https://your-backend.onrender.com`

### Database → MongoDB Atlas
Free M0 cluster → Network Access → Allow `0.0.0.0/0` → Database User → copy connection string to Render `MONGO_URI`.

---

## 📐 Carbon Engine Calibration

| Activity | baseEnergy (kWh / unit) | Unit |
|---|---|---|
| ai_query | 0.0029 | per query |
| email | 0.000017 | per email |
| streaming | 0.077 | per hour |
| video_call | 0.157 | per hour |
| cloud_storage | 0.001 | per GB-day |
| web_browsing | 0.0006 | per page view |
| compute | 0.5 | per hour |

Multiplied by 1.2 (overhead) × 0.71 (kg CO₂ / kWh, India grid). Cost rate: ₹850 / kg CO₂.

---

## 🧪 Scripts

```bash
# Backend
npm run dev         # ts-node-dev hot reload
npm run build       # emit dist/
npm start           # run compiled
npm run seed        # wipe + reseed (real DB only)
npm run typecheck   # tsc --noEmit

# Frontend
npm run dev         # vite dev server (5173)
npm run build       # production bundle
npm run preview     # preview built dist
```

---

## 📜 License

MIT — built for hackathon-grade demoing. Carbon factors are illustrative and order-of-magnitude correct, not audit-grade. PRs welcome.

---

🤖 Built with [Claude Code](https://claude.com/claude-code).
