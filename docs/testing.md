# Testing

Frontend tests are an early project requirement, not a final cleanup task.

## Tooling

- Vitest
- React Testing Library
- jsdom

Backend pytest coverage is **not** in this phase. It will be added when FastAPI exists.

## Run tests

```bash
cd frontend
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## What is covered now

- `componentMap` registers every catalog section type
- `SiteRenderer` renders the matching component for each type
- Section order matches `WebsiteConfig`
- Unknown section types are skipped instead of crashing
- Barber and cafe configs render distinct content
- Important section variants render
- `/site/missing` calls `notFound()`

Preview-editor controls are not tested yet because that UI does not exist.

## Test location

```text
frontend/tests/
```
