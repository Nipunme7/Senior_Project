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

Phase 4 does not require secrets. `.env.example` is a placeholder for later OpenAI and Supabase keys. Do not commit `.env`.
