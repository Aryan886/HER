from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.db_models import Symptom, Visit, VisitSymptom
from models.schemas import LogVisitRequest, VisitResponse, VisitSymptomResponse
from routers.common import get_or_create_user
from services.dismissal_service import calculate_dismissal_rate


router = APIRouter(prefix="/api/visits", tags=["visits"])


def serialize_visit(visit: Visit) -> VisitResponse:
    return VisitResponse(
        id=visit.id,
        user_id=visit.user_id,
        visit_date=visit.visit_date,
        doctor_name=visit.doctor_name,
        specialty=visit.specialty,
        notes=visit.notes,
        dismissal_rate=visit.dismissal_rate,
        symptoms=[
            VisitSymptomResponse(
                symptom_id=item.symptom_id,
                outcome=item.outcome,
                outcome_note=item.outcome_note,
            )
            for item in visit.visit_symptoms
        ],
        created_at=visit.created_at,
    )


@router.post("/log", response_model=VisitResponse, response_model_by_alias=True)
async def log_visit(payload: LogVisitRequest, db: AsyncSession = Depends(get_db)) -> VisitResponse:
    await get_or_create_user(db, payload.user_id)

    symptom_ids = [item.symptom_id for item in payload.symptoms]
    result = await db.execute(
        select(Symptom).where(Symptom.user_id == payload.user_id, Symptom.id.in_(symptom_ids))
    )
    found_ids = {symptom.id for symptom in result.scalars().all()}
    missing = [symptom_id for symptom_id in symptom_ids if symptom_id not in found_ids]
    if missing:
        raise HTTPException(status_code=404, detail=f"Symptom {missing[0]} not found")

    visit = Visit(
        user_id=payload.user_id,
        visit_date=payload.visit_date,
        doctor_name=payload.doctor_name,
        specialty=payload.specialty,
        notes=payload.notes,
        dismissal_rate=calculate_dismissal_rate([item.outcome for item in payload.symptoms]),
    )
    db.add(visit)
    await db.flush()

    for item in payload.symptoms:
        db.add(
            VisitSymptom(
                visit_id=visit.id,
                symptom_id=item.symptom_id,
                outcome=item.outcome,
                outcome_note=item.outcome_note,
            )
        )

    await db.commit()
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visit_symptoms))
        .where(Visit.id == visit.id)
    )
    saved = result.scalar_one()
    return serialize_visit(saved)


@router.get("/all", response_model=list[VisitResponse], response_model_by_alias=True)
async def get_visits(user_id: str = Query(...), db: AsyncSession = Depends(get_db)) -> list[VisitResponse]:
    await get_or_create_user(db, user_id)
    result = await db.execute(
        select(Visit)
        .options(selectinload(Visit.visit_symptoms))
        .where(Visit.user_id == user_id)
        .order_by(Visit.visit_date.desc(), Visit.created_at.desc())
    )
    return [serialize_visit(visit) for visit in result.scalars().all()]
