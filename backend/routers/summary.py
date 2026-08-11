from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.db_models import Symptom, Visit
from models.schemas import DismissalSummary, SummaryResponse
from routers.common import get_or_create_user
from routers.visits import serialize_visit
from services.llm_service import generate_clinical_narrative


router = APIRouter(prefix="/api/summary", tags=["summary"])


@router.get("/generate", response_model=SummaryResponse, response_model_by_alias=True)
async def generate_summary(user_id: str = Query(...), db: AsyncSession = Depends(get_db)) -> SummaryResponse:
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
    total_dismissed = sum(1 for item in presented if item.outcome == "dismissed")

    return SummaryResponse(
        narrative_summary=await generate_clinical_narrative(symptoms, visits),
        symptom_timeline=symptoms,
        visit_history=[serialize_visit(visit) for visit in visits],
        dismissal_summary=DismissalSummary(
            total_dismissed=total_dismissed,
            total_presented=len(presented),
            rate=(total_dismissed / len(presented)) if presented else 0.0,
        ),
    )
