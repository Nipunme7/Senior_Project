# AI Website Generation Platform

Project documentation for the frontend renderer, tests, and CI.

## Current status

Phases 1–4 are in progress on the frontend:

1. Controlled React section catalog
2. Shared `SiteRenderer` with `/site/barber` and `/site/cafe`
3. Vitest + React Testing Library
4. GitHub Actions, TypeDoc, and MkDocs

Supabase, FastAPI, OpenAI, media uploads, and subdomains are **not** implemented yet.

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
