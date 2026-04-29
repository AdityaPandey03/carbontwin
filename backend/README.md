# Carbon Twin — Backend

Node.js + Express + MongoDB (Mongoose) + TypeScript.

## Run locally
```bash
cp .env.example .env
npm install
npm run dev
```
By default `USE_MEMORY_DB=true` runs an in-memory MongoDB and auto-seeds 6 demo users. To use a real Mongo, set `USE_MEMORY_DB=false` and point `MONGO_URI` at your cluster.

## Scripts
- `npm run dev` — hot reload via ts-node-dev
- `npm run build` — emit `dist/`
- `npm start` — run compiled
- `npm run seed` — wipe + reseed (real DB only — pointless for memory mode)
- `npm run typecheck` — `tsc --noEmit`

See the root README for the full API surface.
