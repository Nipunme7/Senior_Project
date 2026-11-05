# Setup

## Requirements

- Node.js 20+
- npm
- Python 3.12 (docs + FastAPI backend)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo sites:

- [http://localhost:3000/site/barber](http://localhost:3000/site/barber) — Elite Cuts
- [http://localhost:3000/site/cafe](http://localhost:3000/site/cafe) — Everest Coffee

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Useful routes:

- `GET /health`
- `GET /v1/catalog`
- `POST /v1/sites/validate`
- `POST /v1/sites/generate` (requires auth + `GEMINI_API_KEY`; optional `persist` + `slug`)
- `POST /v1/sites` (requires Supabase bearer token + `SUPABASE_JWT_SECRET`)
- `GET /v1/sites/public/{slug}`

## Environment

Frontend (`frontend/.env`):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (`backend/.env` or process env):

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...          # Project Settings → API → JWT Secret
SUPABASE_SERVICE_ROLE_KEY=...    # optional; needed to persist sites from the API
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=...               # https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-3.8-flash    # optional override
```

Never put the service-role key in frontend code. Do not commit `.env` files.

JWT Secret is in Supabase **Project Settings → API** (Legacy JWT secret / JWT Secret).

## Supabase / media

See earlier Phase 5–6 steps: run `001_supabase_foundation.sql`, `002_media_system.sql`, and `003_site_media_bucket_public.sql` (makes the `site-media` bucket public so image URLs work).

Owner prototype flow:

1. Start FastAPI (`cd backend && uvicorn main:app --reload --port 8000`)
2. Start Next.js (`cd frontend && npm run dev`)
3. Open `/owner/login`, then `/owner/create`
4. Fill brief → upload media → generate → preview → publish
5. Public site: `/site/{slug}`

## Production frontend (Vercel)

After merging to `main`, GitHub Actions deploys the frontend when secrets are configured. See [Hosting](hosting.md) and [CI/CD](ci-cd.md).
