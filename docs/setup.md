# Setup

## Requirements

- Node.js 20
- npm
- Python 3.12 (documentation builds only)

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

Both routes use the same `SiteRenderer` with different hard-coded `WebsiteConfig` objects.

## Checks

From `frontend/`:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment

Copy `.env.example` to `frontend/.env` (or `frontend/.env.local`) and fill in Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Do not commit `.env` files. Never put the service-role key in frontend code.

## Supabase foundation (Phase 5)

1. Create a free Supabase project.
2. Add the public URL and anon key to `frontend/.env`.
3. In the Supabase SQL Editor, run `supabase/migrations/001_supabase_foundation.sql`.
4. Optionally create an Auth user and run `supabase/seed_demo_sites.sql` (replace `YOUR_USER_UUID`).

Until rows are seeded, `/site/barber` and `/site/cafe` still render from local demo configs.
