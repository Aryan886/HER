from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.db_models import Symptom
from models.schemas import ConfirmSymptomRequest, LogSymptomRequest, SymptomResponse
from routers.common import get_or_create_user
from services.llm_service import extract_symptom_fields


router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


@router.post("/log", response_model=SymptomResponse, response_model_by_alias=True)
async def log_symptom(payload: LogSymptomRequest, db: AsyncSession = Depends(get_db)) -> Symptom:
    await get_or_create_user(db, payload.user_id)
    extracted = await extract_symptom_fields(payload.raw_text)
    symptom = Symptom(user_id=payload.user_id, raw_text=payload.raw_text, **extracted)
    db.add(symptom)
    await db.commit()
    await db.refresh(symptom)
    return symptom


@router.put("/{symptom_id}", response_model=SymptomResponse, response_model_by_alias=True)
async def confirm_symptom(
    symptom_id: str,
    payload: ConfirmSymptomRequest,
    db: AsyncSession = Depends(get_db),
) -> Symptom:
    await get_or_create_user(db, payload.user_id)
    result = await db.execute(
        select(Symptom).where(Symptom.id == symptom_id, Symptom.user_id == payload.user_id)
    )
    symptom = result.scalar_one_or_none()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")

    symptom.raw_text = payload.raw_text
    symptom.clinical_text = payload.clinical_text
    symptom.body_location = payload.body_location
    symptom.symptom_type = payload.symptom_type
    symptom.duration = payload.duration
    symptom.severity = payload.severity
    symptom.onset_pattern = payload.onset_pattern
    symptom.aggravating_factors = payload.aggravating_factors
    symptom.relieving_factors = payload.relieving_factors

    await db.commit()
    await db.refresh(symptom)
    return symptom


@router.get("/all", response_model=list[SymptomResponse], response_model_by_alias=True)
async def get_symptoms(user_id: str = Query(...), db: AsyncSession = Depends(get_db)) -> list[Symptom]:
    await get_or_create_user(db, user_id)
    result = await db.execute(select(Symptom).where(Symptom.user_id == user_id).order_by(Symptom.logged_at.desc()))
    return list(result.scalars().all())
