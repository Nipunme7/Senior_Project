# Hosting

## Current hosting

| Piece | Target | Status |
|---|---|---|
| Next.js frontend and public renderer | Vercel | **Active** — CD deploys `main` after CI passes |
| FastAPI | Render free tier | Later (after Phase 7 backend exists) |
| Postgres / Auth / Storage | Supabase | Active |
| DNS / later wildcard subdomains | Cloudflare | Later (Phase 13+) |

## Frontend deploy (Vercel)

One shared frontend deployment serves all tenants via routes:

```text
/site/barber
/site/cafe
```

Do **not** create one Vercel project per business.

### First-time Vercel setup

1. Create a Vercel account and import the GitHub repo `Nipunme7/Senior_Project`.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Next.js.
4. Add environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Create a Vercel token: Account Settings → Tokens.
6. Copy **Org ID** and **Project ID** from the Vercel project settings (or from `.vercel/project.json` after `vercel link`).
7. In GitHub → repo → Settings → Secrets and variables → Actions, add:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. Optionally create a GitHub Environment named `production` for the Deploy job.

### Continuous delivery

On every push to `main`, GitHub Actions:

1. Runs Frontend + Documentation checks
2. If both pass, runs **Deploy Frontend** to Vercel production

The Deploy job runs from the **repo root**. Keep Vercel **Root Directory** set to `frontend` (do not also `cd frontend` in Actions, or the path becomes `frontend/frontend`).

Pull requests do **not** production-deploy; they only run CI.

## Not deployed yet

- FastAPI (Phase 7+)
- MkDocs public docs hosting
- Wildcard subdomains (`*.yourplatform.com`)

Those remain later-phase work. Phase 14 focuses on backend deploy, Cloudflare, security review, and presentation polish.
