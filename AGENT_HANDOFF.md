# HER Agent Handoff

This document summarizes the current frontend and backend implementation so another agent can continue building quickly.

## Project Overview

HER means "Heard, Evidenced, Recorded." It is a demo healthcare record app for logging symptoms in patient language, converting them into clinical wording, recording doctor visit outcomes, tracking dismissal patterns, and exporting a clinical summary.

The repo has two apps:

- `frontend`: Next.js 14 app router prototype.
- `backend`: FastAPI API with SQLite persistence and optional Anthropic-powered clinical text generation.

## Current Status

The frontend and backend are connected by a shared camelCase JSON contract. The frontend can still run fully in mock mode when `NEXT_PUBLIC_API_URL` is unset. When `NEXT_PUBLIC_API_URL=http://localhost:8000` is configured, the frontend calls the FastAPI backend.

Verified commands from the current build:

```powershell
cd backend
python -m scripts.smoke_test
python -m compileall .
```

```powershell
cd frontend
npm.cmd run build
```

All of the above passed.

## Demo Login

The frontend has local demo auth only.

```text
Email: demo@her.app
Password: HER2024
Demo user id: 00000000-0000-0000-0000-000000000001
```

Auth is stored in browser localStorage under `her-demo-session`. There is no backend authentication yet.

## Frontend

Main stack:

- Next.js `14.2.35`
- React `18.3.1`
- TypeScript
- Tailwind CSS
- react-hook-form
- lucide-react icons
- Recharts
- jsPDF and jspdf-autotable for summary export

Important files:

- `frontend/app/login/page.tsx`: demo login screen.
- `frontend/app/dashboard/page.tsx`: dismissal dashboard.
- `frontend/app/symptoms/page.tsx`: symptom list.
- `frontend/app/symptoms/new/page.tsx`: symptom logging and confirmation flow.
- `frontend/app/visits/page.tsx`: visit list.
- `frontend/app/visits/new/page.tsx`: visit outcome form.
- `frontend/app/summary/page.tsx`: generated summary and PDF export.
- `frontend/lib/api.ts`: switches between mock data and backend API.
- `frontend/lib/mock/*`: mock-mode data and handlers.
- `frontend/types/index.ts`: frontend data contract.
- `frontend/lib/auth/AuthProvider.tsx`: local demo auth.

Frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_USER_ID=00000000-0000-0000-0000-000000000001
```

Run frontend:

```powershell
cd frontend
npm install
npm run dev
```

Build frontend:

```powershell
cd frontend
npm.cmd run build
```

## Backend

Main stack:

- FastAPI `0.111.0`
- Uvicorn
- SQLAlchemy async ORM
- Alembic migrations
- SQLite via `aiosqlite` by default
- `asyncpg` is included for future Postgres use
- Pydantic v2 and pydantic-settings
- Anthropic SDK, optional
- httpx for smoke tests

Important files:

- `backend/main.py`: FastAPI app, CORS, lifespan DB init, router registration, `/health`.
- `backend/config.py`: environment settings.
- `backend/database.py`: async SQLAlchemy engine/session and dev schema creation fallback.
- `backend/alembic.ini` and `backend/migrations/*`: Alembic configuration and initial schema migration.
- `backend/models/db_models.py`: SQLAlchemy tables.
- `backend/models/schemas.py`: Pydantic request/response models.
- `backend/routers/symptoms.py`: symptom log/list/update endpoints.
- `backend/routers/visits.py`: visit log/list endpoints.
- `backend/routers/dashboard.py`: dismissal dashboard endpoint.
- `backend/routers/summary.py`: summary generation endpoint.
- `backend/routers/common.py`: demo user helper.
- `backend/services/llm_service.py`: Anthropic calls with deterministic fallback extraction/summary.
- `backend/services/dismissal_service.py`: dismissal metrics.
- `backend/scripts/seed_demo.py`: seed data matching the frontend mock dataset.
- `backend/scripts/smoke_test.py`: in-process API smoke test using a temporary SQLite DB.

Backend env:

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
DATABASE_URL=sqlite+aiosqlite:///./medrecord.db
ALLOWED_ORIGINS=http://localhost:3000
APP_ENV=development
DEBUG=true
```

Run backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m alembic upgrade head
python -m scripts.seed_demo
uvicorn main:app --reload --port 8000
```

Backend URL:

```text
http://localhost:8000
```

Health check:

```text
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "app": "HER API"
}
```

## Database Model

Tables:

- `users`: demo/user identity.
- `symptoms`: raw symptom text, clinical rewrite, body location, symptom type, duration, severity, onset pattern, aggravating factors, relieving factors, logged timestamp.
- `visits`: doctor visit metadata, notes, calculated dismissal rate.
- `visit_symptoms`: many-to-many visit/symptom outcome rows with `addressed`, `partial`, or `dismissed`.

SQLite database path is ignored by git:

```text
backend/medrecord.db
```

Alembic is configured for production-style schema management. The FastAPI lifespan still calls `init_db()` as a local/dev fallback, so the demo remains easy to start on a fresh SQLite database.

## API Contract

Responses use camelCase because backend response models use Pydantic alias generation.

### Log Symptom

```text
POST /api/symptoms/log
```

Request:

```json
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "rawText": "I have severe pelvic pain around my period for 8 months..."
}
```

Response shape:

```json
{
  "id": "sym-...",
  "userId": "...",
  "rawText": "...",
  "clinicalText": "...",
  "bodyLocation": "Lower abdomen / pelvis",
  "symptomType": "Pelvic pain / Dysmenorrhea",
  "duration": "8 months",
  "severity": 8,
  "onsetPattern": "Cyclical",
  "aggravatingFactors": [],
  "relievingFactors": [],
  "loggedAt": "..."
}
```

### Confirm Or Edit Symptom

```text
PUT /api/symptoms/{symptom_id}
```

Request is the full `Symptom` object from the frontend. This persists edits from the confirmation card, including duration, severity, onset pattern, and factor lists.

### List Symptoms

```text
GET /api/symptoms/all?user_id={userId}
```

Returns `Symptom[]`, newest first.

### Log Visit

```text
POST /api/visits/log
```

Request:

```json
{
  "userId": "...",
  "visitDate": "2026-08-10",
  "doctorName": "Dr. Example",
  "specialty": "GP",
  "notes": "Visit notes.",
  "symptoms": [
    {
      "symptomId": "sym-...",
      "outcome": "dismissed",
      "outcomeNote": "No investigation ordered."
    }
  ]
}
```

`dismissalRate` is calculated as dismissed outcomes divided by total outcomes.

### List Visits

```text
GET /api/visits/all?user_id={userId}
```

Returns `Visit[]`, newest first.

### Dashboard

```text
GET /api/dashboard?user_id={userId}
```

Returns:

- `totalSymptoms`
- `totalVisits`
- `overallDismissalRate`
- `dismissalByVisit`
- `mostDismissedSymptoms`
- `dismissalTrend`

### Summary

```text
GET /api/summary/generate?user_id={userId}
```

Returns:

- `narrativeSummary`
- `symptomTimeline`
- `visitHistory`
- `dismissalSummary`

When no `ANTHROPIC_API_KEY` is set, summary generation uses a deterministic fallback.

## LLM Behavior

`backend/services/llm_service.py` has two Anthropic-powered paths:

- `extract_symptom_fields(raw_text)`: converts patient language into clinical fields.
- `generate_clinical_narrative(symptoms, visits)`: writes a concise objective clinical summary.

If Anthropic is not configured, both paths fall back without failing the app.

The current default model is configured in `backend/config.py`:

```text
claude-sonnet-4-20250514
```

## Verification Details

Backend smoke test:

```powershell
cd backend
python -m scripts.smoke_test
```

What it checks:

- creates a temporary SQLite DB
- logs a symptom
- confirms/edits the symptom
- logs a visit
- verifies dismissal rate
- fetches dashboard metrics
- fetches summary data

Frontend build:

```powershell
cd frontend
npm.cmd run build
```

This currently compiles, lints, type-checks, and statically renders all routes successfully.

## Deployment

`backend/render.yaml` defines a Render web service for the backend. It installs dependencies, runs `alembic upgrade head`, and starts Uvicorn with Render's `$PORT`.

## Known Limitations And Next Steps

- Backend auth is not implemented. The current user flow trusts `userId` from the frontend.
- There are no formal pytest tests yet. `scripts/smoke_test.py` is the current backend regression check.
- The frontend has generic error messages. Better API error details could be surfaced in hooks/components.
- Visit update/delete and symptom delete endpoints are not implemented.
- No file uploads, attachments, doctor documents, or lab records exist yet.
- Frontend deployment config is not present; backend Render config exists in `backend/render.yaml`.
- CORS defaults to `http://localhost:3000`; update `ALLOWED_ORIGINS` for other frontend URLs.
- If using Postgres, set `DATABASE_URL` to an async SQLAlchemy URL such as `postgresql+asyncpg://...`.

## Git/Workspace Notes

At the time this handoff was created, much of the backend appeared as newly added or modified in the working tree. Do not assume all untracked backend files are accidental; they are part of the current implementation.

Ignored generated/runtime files include:

- frontend build/cache output
- `node_modules`
- Python `__pycache__`
- `backend/medrecord.db`
- backend/frontend `.log` and `.err` files
