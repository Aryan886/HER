from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class LogSymptomRequest(BaseModel):
    user_id: str = Field(validation_alias=AliasChoices("user_id", "userId"))
    raw_text: str = Field(min_length=20, validation_alias=AliasChoices("raw_text", "rawText"))


class ConfirmSymptomRequest(BaseModel):
    user_id: str = Field(validation_alias=AliasChoices("user_id", "userId"))
    raw_text: str = Field(min_length=1, validation_alias=AliasChoices("raw_text", "rawText"))
    clinical_text: str = Field(min_length=1, validation_alias=AliasChoices("clinical_text", "clinicalText"))
    body_location: str | None = Field(default=None, validation_alias=AliasChoices("body_location", "bodyLocation"))
    symptom_type: str | None = Field(default=None, validation_alias=AliasChoices("symptom_type", "symptomType"))
    duration: str | None = None
    severity: int | None = Field(default=None, ge=1, le=10)
    onset_pattern: str | None = Field(default=None, validation_alias=AliasChoices("onset_pattern", "onsetPattern"))
    aggravating_factors: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("aggravating_factors", "aggravatingFactors"),
    )
    relieving_factors: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("relieving_factors", "relievingFactors"),
    )


class VisitSymptomInput(BaseModel):
    symptom_id: str = Field(validation_alias=AliasChoices("symptom_id", "symptomId"))
    outcome: Literal["addressed", "partial", "dismissed"]
    outcome_note: str | None = Field(default=None, validation_alias=AliasChoices("outcome_note", "outcomeNote"))


class LogVisitRequest(BaseModel):
    user_id: str = Field(validation_alias=AliasChoices("user_id", "userId"))
    visit_date: date = Field(validation_alias=AliasChoices("visit_date", "visitDate"))
    doctor_name: str = Field(validation_alias=AliasChoices("doctor_name", "doctorName"))
    specialty: str
    notes: str | None = None
    symptoms: list[VisitSymptomInput] = Field(min_length=1)


class SymptomResponse(CamelModel):
    id: str
    user_id: str
    raw_text: str
    clinical_text: str
    body_location: str | None = None
    symptom_type: str | None = None
    duration: str | None = None
    severity: int | None = None
    onset_pattern: str | None = None
    aggravating_factors: list[str] = Field(default_factory=list)
    relieving_factors: list[str] = Field(default_factory=list)
    logged_at: datetime


class VisitSymptomResponse(CamelModel):
    symptom_id: str
    outcome: Literal["addressed", "partial", "dismissed"]
    outcome_note: str | None = None


class VisitResponse(CamelModel):
    id: str
    user_id: str
    visit_date: date
    doctor_name: str
    specialty: str
    notes: str | None = None
    dismissal_rate: float
    symptoms: list[VisitSymptomResponse] = Field(default_factory=list)
    created_at: datetime


class DismissalByVisitItem(CamelModel):
    visit_date: date
    doctor_name: str
    specialty: str
    rate: float


class MostDismissedSymptomItem(CamelModel):
    symptom_type: str
    times_presented: int
    times_dismissed: int


class DismissalTrendItem(CamelModel):
    visit_date: date
    rate: float


class DashboardResponse(CamelModel):
    total_symptoms: int
    total_visits: int
    overall_dismissal_rate: float
    dismissal_by_visit: list[DismissalByVisitItem]
    most_dismissed_symptoms: list[MostDismissedSymptomItem]
    dismissal_trend: list[DismissalTrendItem]


class DismissalSummary(CamelModel):
    total_dismissed: int
    total_presented: int
    rate: float


class SummaryResponse(CamelModel):
    narrative_summary: str | None = None
    symptom_timeline: list[SymptomResponse]
    visit_history: list[VisitResponse]
    dismissal_summary: DismissalSummary
