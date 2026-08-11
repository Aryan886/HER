from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.db_models import Symptom, Visit
from models.schemas import DashboardResponse
from routers.common import get_or_create_user
from services.dismissal_service import (
    build_dismissal_by_visit,
    build_dismissal_trend,
    build_most_dismissed_symptoms,
)


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse, response_model_by_alias=True)
async def get_dashboard(user_id: str = Query(...), db: AsyncSession = Depends(get_db)) -> DashboardResponse:
    await get_or_create_user(db, user_id)
    symptoms_result = await db.execute(
        select(Symptom).where(Symptom.user_id == user_id).order_by(Symptom.logged_at.asc())
    )
    visits_result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visit_symptoms))
        .where(Visit.user_id == user_id)
        .order_by(Visit.visit_date.asc(), Visit.created_at.asc())
    )
    symptoms = list(symptoms_result.scalars().all())
    visits = list(visits_result.scalars().all())
    presented = [item for visit in visits for item in visit.visit_symptoms]
    dismissed = [item for item in presented if item.outcome == "dismissed"]

    return DashboardResponse(
        total_symptoms=len(symptoms),
        total_visits=len(visits),
        overall_dismissal_rate=(len(dismissed) / len(presented)) if presented else 0.0,
        dismissal_by_visit=build_dismissal_by_visit(visits),
        most_dismissed_symptoms=build_most_dismissed_symptoms(symptoms, visits),
        dismissal_trend=build_dismissal_trend(visits),
    )
