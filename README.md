# HER

Heard, Evidenced, Recorded.

## Structure

- `frontend` - Next.js 14 prototype for the HER demo app.
- `backend` - FastAPI API for symptom records, visit outcomes, dashboard metrics, and clinical summaries.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Demo login:

```text
demo@her.app / HER2024
```

## Backend

```bash
cd backend
pip install -r requirements.txt
python -m alembic upgrade head
python -m scripts.seed_demo
uvicorn main:app --reload --port 8000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local` to use the real backend.
