# CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

## When it runs

- **Pull requests** — Frontend + Documentation checks (no production deploy)
- **Push to `main`** — same checks, then **Deploy Frontend** to Vercel if checks pass

## Pipeline

### Frontend job

1. Install npm dependencies (`npm ci`)
2. Lint
3. Typecheck
4. Vitest
5. Next.js production build
6. TypeDoc build

### Documentation job

1. TypeDoc build
2. MkDocs build (`mkdocs build --strict`)

### Deploy Frontend job (CD)

Runs only on `main` after both jobs above succeed (from the **repo root**; Vercel Root Directory = `frontend`):

1. Install Vercel CLI
2. `vercel pull` (production)
3. `vercel build --prod`
4. `vercel deploy --prebuilt --prod`

Required GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

See [Hosting](hosting.md) for first-time Vercel setup.

## Rule

Do not treat a merge as successful if Frontend or Documentation failed.  
Do not production-deploy from a feature branch.

## When FastAPI is added

Extend CI with:

- backend dependency install
- backend lint/checks
- pytest
- FastAPI import/startup validation

Add a separate Render deploy step only after the backend exists and has its own secrets.
