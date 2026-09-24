# AI Website Generation Platform

Project documentation for the frontend renderer, tests, and CI.

## Current status

Phases 1–4 are complete on the frontend. Phase 5 (Supabase foundation) is in progress:

1. Controlled React section catalog
2. Shared `SiteRenderer` with `/site/barber` and `/site/cafe`
3. Vitest + React Testing Library
4. GitHub Actions, TypeDoc, and MkDocs
5. Supabase tables, RLS, client, and published-site reads (with demo fallback)

FastAPI, OpenAI, media uploads, and subdomains are **not** implemented yet.

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
