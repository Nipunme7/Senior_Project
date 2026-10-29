# Testing

Testing is an early project requirement, not a final cleanup task.

## Frontend

Tooling:

- Vitest
- React Testing Library
- jsdom

```bash
cd frontend
npm run test
```

Covers renderer/registry/demo/media helpers under `frontend/tests/`.

## Backend

Tooling:

- pytest
- FastAPI TestClient

```bash
cd backend
pip install -r requirements.txt
pytest
```

Covers:

- `/health`
- `/v1/catalog`
- `WebsiteConfig` validation (valid, unknown type, bad variant, duplicate ids)
- auth-required site create (401 / JWT / local draft mode)

AI generation is not covered by live OpenAI calls in unit tests.
