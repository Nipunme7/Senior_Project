# AI Website Generation Platform

Project documentation for the frontend renderer, tests, and CI.

## Current status

Phases 1–5 are complete. Phase 6 (media system) is in progress:

1. Controlled React section catalog
2. Shared `SiteRenderer` with `/site/barber` and `/site/cafe`
3. Vitest + React Testing Library
4. GitHub Actions, TypeDoc, and MkDocs
5. Supabase tables, RLS, client, and published-site reads (with demo fallback)
6. Media upload, metadata records, media IDs, and Storage URL resolution

FastAPI, OpenAI, and subdomains are **not** implemented yet.

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
