# AI Website Generation Platform

An AI-powered website generation platform for small businesses.

This repository contains the Next.js frontend, FastAPI backend, tests, CI, and public project docs.

## Current phase

Owner AI prototype: login → brief → media → Gemini generate → preview → publish.

Still later: section editing, subdomains.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- [http://localhost:3000/owner/login](http://localhost:3000/owner/login) — sign in
- [http://localhost:3000/owner/create](http://localhost:3000/owner/create) — create / generate
- [http://localhost:3000/site/your-slug](http://localhost:3000/site/your-slug) — published public site

Run FastAPI locally as well (`cd backend && uvicorn main:app --reload --port 8000`) and set `NEXT_PUBLIC_API_URL=http://localhost:8000`.

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
