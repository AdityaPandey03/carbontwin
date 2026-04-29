# Carbon Twin — Frontend

Vite + React + TypeScript + Tailwind dashboard, talks to the Carbon Twin backend.

## Run locally
```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:5173 (or whichever port Vite picks)
```

The frontend reads `VITE_API_URL` from `.env.local` (default `http://localhost:4000`). If the backend is unreachable, the UI falls back gracefully to mock data.

## API wiring
`src/services/mockApi.ts` is the single integration point. It exposes the same `api.*` shape the components were already using, but each method now hits the real backend (`/api/dashboard/:userId`, `/api/leaderboard`, `/api/recommendations/:userId`, `/api/simulate`, `/api/threshold/:userId`, `/api/alerts/:userId`, `/api/activities`) and maps the response back to the UI's expected shape. The first available user (highest eco-score) is auto-selected.
