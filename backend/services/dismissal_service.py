from collections import defaultdict

from models.db_models import Symptom, Visit
from models.schemas import DismissalByVisitItem, DismissalTrendItem, MostDismissedSymptomItem


def calculate_dismissal_rate(outcomes: list[str]) -> float:
    if not outcomes:
        return 0.0
    dismissed = sum(1 for outcome in outcomes if outcome == "dismissed")
    return dismissed / len(outcomes)


def build_dismissal_by_visit(visits: list[Visit]) -> list[DismissalByVisitItem]:
    return [
        DismissalByVisitItem(
            visit_date=visit.visit_date,
            doctor_name=visit.doctor_name,
            specialty=visit.specialty,
            rate=visit.dismissal_rate,
        )
        for visit in visits
    ]


def build_dismissal_trend(visits: list[Visit]) -> list[DismissalTrendItem]:
    return [DismissalTrendItem(visit_date=visit.visit_date, rate=visit.dismissal_rate) for visit in visits]


def build_most_dismissed_symptoms(symptoms: list[Symptom], visits: list[Visit]) -> list[MostDismissedSymptomItem]:
    symptom_lookup = {symptom.id: symptom for symptom in symptoms}
    grouped: dict[str, dict[str, int | str]] = defaultdict(
        lambda: {"symptom_type": "Unspecified symptom", "times_presented": 0, "times_dismissed": 0}
    )

    for visit in visits:
        for item in visit.visit_symptoms:
            symptom = symptom_lookup.get(item.symptom_id)
            key = symptom.symptom_type if symptom and symptom.symptom_type else "Unspecified symptom"
            grouped[key]["symptom_type"] = key
            grouped[key]["times_presented"] = int(grouped[key]["times_presented"]) + 1
            if item.outcome == "dismissed":
                grouped[key]["times_dismissed"] = int(grouped[key]["times_dismissed"]) + 1

    rows = [
        MostDismissedSymptomItem(
            symptom_type=str(value["symptom_type"]),
            times_presented=int(value["times_presented"]),
            times_dismissed=int(value["times_dismissed"]),
        )
        for value in grouped.values()
    ]
    return sorted(rows, key=lambda row: row.times_dismissed, reverse=True)
