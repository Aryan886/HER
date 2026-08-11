import uuid
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4()}"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    symptoms: Mapped[list["Symptom"]] = relationship(
        "Symptom", back_populates="user", cascade="all, delete-orphan"
    )
    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="user", cascade="all, delete-orphan")


class Symptom(Base):
    __tablename__ = "symptoms"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=lambda: generate_id("sym"))
    user_id: Mapped[str] = mapped_column(String(80), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    clinical_text: Mapped[str] = mapped_column(Text, nullable=False)
    body_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    symptom_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severity: Mapped[int | None] = mapped_column(Integer, CheckConstraint("severity BETWEEN 1 AND 10"), nullable=True)
    onset_pattern: Mapped[str | None] = mapped_column(String(255), nullable=True)
    aggravating_factors: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    relieving_factors: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="symptoms")
    visit_symptoms: Mapped[list["VisitSymptom"]] = relationship("VisitSymptom", back_populates="symptom")


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=lambda: generate_id("vis"))
    user_id: Mapped[str] = mapped_column(String(80), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    doctor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    dismissal_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="visits")
    visit_symptoms: Mapped[list["VisitSymptom"]] = relationship(
        "VisitSymptom", back_populates="visit", cascade="all, delete-orphan"
    )


class VisitSymptom(Base):
    __tablename__ = "visit_symptoms"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=lambda: generate_id("vs"))
    visit_id: Mapped[str] = mapped_column(String(80), ForeignKey("visits.id", ondelete="CASCADE"), nullable=False)
    symptom_id: Mapped[str] = mapped_column(String(80), ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False)
    outcome: Mapped[str] = mapped_column(
        String(50),
        CheckConstraint("outcome IN ('addressed', 'partial', 'dismissed')"),
        nullable=False,
    )
    outcome_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    visit: Mapped["Visit"] = relationship("Visit", back_populates="visit_symptoms")
    symptom: Mapped["Symptom"] = relationship("Symptom", back_populates="visit_symptoms")
