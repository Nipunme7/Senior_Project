# AI Website Generation Platform

Project documentation for the frontend renderer, FastAPI backend, tests, and CI.

## Current status

Phases 1–8 are complete. The owner AI prototype is in progress:

1. Controlled React section catalog
2. Shared `SiteRenderer` for tenant sites
3. Vitest + React Testing Library
4. GitHub Actions, TypeDoc, and MkDocs
5. Supabase tables, RLS, client, and published-site reads
6. Media upload, media IDs, and Storage resolution
7. Vercel production deploy from `main` after CI
8. FastAPI validation, catalog, auth foundation, site APIs
9. Gemini full-site `WebsiteConfig` generation + validation gate
10. **Now:** Owner login → brief → media → generate → preview → publish

Hardcoded public demos are removed; public sites come from published Supabase rows. Subdomains are **not** implemented yet.

## Local doc builds

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

TypeScript API docs:

```bash
cd frontend
npm run docs:typedoc
```

FastAPI interactive docs (when the backend is running):

```text
http://localhost:8000/docs
```
