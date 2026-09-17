# CI/CD

GitHub Actions runs on pushes and pull requests to `main`.

## Current pipeline

Workflow: `.github/workflows/ci.yml`

Frontend job:

1. Install npm dependencies
2. Lint
3. Typecheck
4. Vitest
5. Next.js production build
6. TypeDoc build

Documentation job:

1. TypeDoc build
2. MkDocs build (`mkdocs build --strict`)

Deployment is **not** automated yet. Do not deploy unless these checks pass.

## When FastAPI is added

Extend CI with:

- backend lint
- pytest
- FastAPI startup/import validation
- OpenAPI/Swagger via FastAPI `/docs` and `/redoc`

Do not add those jobs before the backend exists.
