# HER Backend

FastAPI backend for the HER frontend.

## Local Run

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

The API will be available at `http://localhost:8000`.

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local` to switch the frontend from mocks to this API.

## Database Migrations

Alembic is configured for the async SQLAlchemy database:

```powershell
cd backend
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "describe change"
```

The first migration creates `users`, `symptoms`, `visits`, and `visit_symptoms`.

## Deployment

`render.yaml` defines a Render web service that installs dependencies, applies Alembic migrations, and starts Uvicorn. Set these environment variables in Render:

```env
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql+asyncpg://...
ALLOWED_ORIGINS=https://your-frontend-domain
```

## Verification

```powershell
cd backend
python -m scripts.smoke_test
```

The smoke test uses a temporary SQLite database and covers symptom extraction, symptom confirmation, visit logging, dashboard metrics, and summary generation.
