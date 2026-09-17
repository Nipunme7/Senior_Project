# AI Website Generation Platform

An AI-powered website generation platform for small businesses.

This repository contains the Next.js frontend, tests, CI, and public project docs.

## Current phase

Phase 4: GitHub Actions CI plus TypeDoc and MkDocs documentation builds.

Still not started: Supabase, FastAPI, OpenAI, uploads, and subdomains.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- [http://localhost:3000/site/barber](http://localhost:3000/site/barber) — Elite Cuts
- [http://localhost:3000/site/cafe](http://localhost:3000/site/cafe) — Everest Coffee

## Checks

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
npm run docs:typedoc
```

## Documentation

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

## Stack

- Next.js, React, TypeScript, Tailwind CSS
- Vitest, React Testing Library
- GitHub Actions, TypeDoc, MkDocs
