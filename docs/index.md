# AI Website Generation Platform

Project documentation for the frontend renderer, FastAPI backend, tests, and CI.

## Current status

Phases 1–6b are complete. Phase 7 (FastAPI backend) is in progress:

1. Controlled React section catalog
2. Shared `SiteRenderer` with `/site/barber` and `/site/cafe`
3. Vitest + React Testing Library
4. GitHub Actions, TypeDoc, and MkDocs
5. Supabase tables, RLS, client, and published-site reads
6. Media upload, media IDs, and Storage resolution
7. Vercel production deploy from `main` after CI
8. **Now:** FastAPI validation, catalog, auth foundation, site APIs

OpenAI generation and subdomains are **not** implemented yet.

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
