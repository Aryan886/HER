"""initial schema

Revision ID: 20260810_0001
Revises:
Create Date: 2026-08-10 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260810_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "symptoms",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("user_id", sa.String(length=80), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=False),
        sa.Column("clinical_text", sa.Text(), nullable=False),
        sa.Column("body_location", sa.String(length=255), nullable=True),
        sa.Column("symptom_type", sa.String(length=255), nullable=True),
        sa.Column("duration", sa.String(length=255), nullable=True),
        sa.Column("severity", sa.Integer(), nullable=True),
        sa.Column("onset_pattern", sa.String(length=255), nullable=True),
        sa.Column("aggravating_factors", sa.JSON(), nullable=False),
        sa.Column("relieving_factors", sa.JSON(), nullable=False),
        sa.Column("logged_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("severity BETWEEN 1 AND 10", name="ck_symptoms_severity_range"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "visits",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("user_id", sa.String(length=80), nullable=False),
        sa.Column("visit_date", sa.Date(), nullable=False),
        sa.Column("doctor_name", sa.String(length=255), nullable=False),
        sa.Column("specialty", sa.String(length=255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("dismissal_rate", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "visit_symptoms",
        sa.Column("id", sa.String(length=80), nullable=False),
        sa.Column("visit_id", sa.String(length=80), nullable=False),
        sa.Column("symptom_id", sa.String(length=80), nullable=False),
        sa.Column("outcome", sa.String(length=50), nullable=False),
        sa.Column("outcome_note", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "outcome IN ('addressed', 'partial', 'dismissed')",
            name="ck_visit_symptoms_outcome",
        ),
        sa.ForeignKeyConstraint(["symptom_id"], ["symptoms.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["visit_id"], ["visits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("visit_symptoms")
    op.drop_table("visits")
    op.drop_table("symptoms")
    op.drop_table("users")
