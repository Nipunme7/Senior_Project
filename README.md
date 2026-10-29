# AI Website Generation Platform

An AI-powered website generation platform for small businesses.

This repository contains the Next.js frontend, FastAPI backend, tests, CI, and public project docs.

## Current phase

Phase 8: Gemini full-site generation (`POST /v1/sites/generate`) on the FastAPI backend.

Still later: section editing, publish UX, subdomains.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- [http://localhost:3000/site/barber](http://localhost:3000/site/barber) — Elite Cuts
- [http://localhost:3000/site/cafe](http://localhost:3000/site/cafe) — Everest Coffee

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Checks

Frontend:

```bash
cd frontend
npm run lint && npm run typecheck && npm run test && npm run build
```

Backend:

```bash
cd backend
pytest
```

## Documentation

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

## Stack

- Next.js, React, TypeScript, Tailwind CSS
- FastAPI, Pydantic, pytest
- Supabase (Postgres, Auth, Storage)
- Vitest, GitHub Actions, TypeDoc, MkDocs
- Vercel (frontend hosting)
