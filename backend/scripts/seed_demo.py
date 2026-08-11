import asyncio
from datetime import date, datetime

from sqlalchemy import select

from database import AsyncSessionLocal, init_db
from models.db_models import Symptom, User, Visit, VisitSymptom


DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

DEMO_SYMPTOMS = [
    {
        "id": "sym-001",
        "raw_text": "I get this really bad pain in my lower stomach and pelvis especially around my period. It's been going on for maybe a year. Nothing really helps, even ibuprofen. It's like a deep cramping that sometimes shoots down my legs.",
        "clinical_text": "Patient reports severe dysmenorrhea with associated pelvic pain for approximately 12 months. Pain is described as deep and cramping, with radiation to the bilateral lower extremities. Severity rated 8/10. Not relieved by NSAIDs.",
        "body_location": "Lower abdomen / pelvis",
        "symptom_type": "Pelvic pain / Dysmenorrhea",
        "duration": "~12 months",
        "severity": 8,
        "onset_pattern": "Cyclical, menstrual correlation",
        "aggravating_factors": ["Menstruation", "Physical activity"],
        "relieving_factors": [],
        "logged_at": datetime(2024, 1, 20, 9, 14, 0),
    },
    {
        "id": "sym-002",
        "raw_text": "I'm exhausted all the time. Even after sleeping 9 hours I wake up feeling like I haven't slept at all. It started around the same time as the pain. I also feel foggy and can't concentrate at work.",
        "clinical_text": "Patient reports persistent fatigue and cognitive impairment for approximately 12 months, concurrent with onset of pelvic pain. Fatigue is not relieved by extended sleep. Functional impact rated 7/10.",
        "body_location": "Generalized",
        "symptom_type": "Fatigue / Cognitive impairment",
        "duration": "~12 months",
        "severity": 7,
        "onset_pattern": "Persistent, concurrent with pain onset",
        "aggravating_factors": ["Work demands", "Poor sleep quality"],
        "relieving_factors": [],
        "logged_at": datetime(2024, 1, 20, 9, 28, 0),
    },
    {
        "id": "sym-003",
        "raw_text": "My stomach bloats really badly, especially in the week before my period. People have asked if I'm pregnant. It goes down after my period but comes right back next month.",
        "clinical_text": "Patient reports cyclical abdominal bloating correlated with the premenstrual phase, approximately one week prior to menses. Symptom resolves post-menstrually and recurs each cycle. Severity rated 6/10.",
        "body_location": "Abdomen",
        "symptom_type": "Abdominal bloating",
        "duration": "Recurring monthly",
        "severity": 6,
        "onset_pattern": "Cyclical, premenstrual",
        "aggravating_factors": ["Premenstrual week"],
        "relieving_factors": ["After menstruation"],
        "logged_at": datetime(2024, 2, 10, 11, 5, 0),
    },
    {
        "id": "sym-004",
        "raw_text": "My shoulders and hips ache constantly. Some days it's bad enough that I can't lift things. Started maybe 6 months ago. Worse in the morning.",
        "clinical_text": "Patient reports bilateral shoulder and hip arthralgia of approximately 6 months duration, with morning stiffness as the primary aggravating pattern. Pain affects functional capacity for lifting. Severity rated 5/10.",
        "body_location": "Shoulders / hips",
        "symptom_type": "Joint pain / Arthralgia",
        "duration": "~6 months",
        "severity": 5,
        "onset_pattern": "Persistent, worse in mornings",
        "aggravating_factors": ["Morning stiffness", "Lifting"],
        "relieving_factors": [],
        "logged_at": datetime(2024, 3, 5, 16, 40, 0),
    },
]

DEMO_VISITS = [
    {
        "id": "vis-001",
        "visit_date": date(2024, 2, 1),
        "doctor_name": "Dr. Rohan Mehta",
        "specialty": "General Practitioner",
        "notes": "Routine consultation. Doctor attributed pelvic pain to normal period cramps and fatigue to stress.",
        "dismissal_rate": 2 / 3,
        "symptoms": [
            {"symptom_id": "sym-001", "outcome": "dismissed", "outcome_note": "Told it was normal menstrual cramping. No investigation ordered."},
            {"symptom_id": "sym-002", "outcome": "partial", "outcome_note": "Attributed to work stress. Thyroid blood test ordered."},
            {"symptom_id": "sym-003", "outcome": "dismissed", "outcome_note": "Not addressed in appointment."},
        ],
    },
    {
        "id": "vis-002",
        "visit_date": date(2024, 3, 18),
        "doctor_name": "Dr. Sunita Rao",
        "specialty": "Gynaecologist",
        "notes": "Referral from GP. Pelvic pain and bloating discussed. Ultrasound ordered.",
        "dismissal_rate": 0.5,
        "symptoms": [
            {"symptom_id": "sym-001", "outcome": "addressed", "outcome_note": "Ultrasound ordered. Possible endometriosis mentioned."},
            {"symptom_id": "sym-003", "outcome": "addressed", "outcome_note": "Linked to suspected endometriosis. Dietary diary requested."},
            {"symptom_id": "sym-004", "outcome": "dismissed", "outcome_note": "Not in scope for this appointment. Advised to return to GP."},
            {"symptom_id": "sym-002", "outcome": "dismissed", "outcome_note": "Not discussed."},
        ],
    },
]


async def seed() -> None:
    await init_db()
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.id == DEMO_USER_ID))
        if existing.scalar_one_or_none():
            print("Demo user already exists; skipping seed.")
            return

        db.add(User(id=DEMO_USER_ID, email="demo@her.app", name="Priya Sharma"))
        await db.flush()

        for symptom in DEMO_SYMPTOMS:
            db.add(Symptom(user_id=DEMO_USER_ID, **symptom))
        await db.flush()

        for visit_data in DEMO_VISITS:
            symptom_rows = visit_data["symptoms"]
            visit = Visit(
                id=visit_data["id"],
                user_id=DEMO_USER_ID,
                visit_date=visit_data["visit_date"],
                doctor_name=visit_data["doctor_name"],
                specialty=visit_data["specialty"],
                notes=visit_data["notes"],
                dismissal_rate=visit_data["dismissal_rate"],
            )
            db.add(visit)
            await db.flush()
            for symptom_row in symptom_rows:
                db.add(VisitSymptom(visit_id=visit.id, **symptom_row))

        await db.commit()
        print(f"Seeded demo user {DEMO_USER_ID}")


if __name__ == "__main__":
    asyncio.run(seed())
