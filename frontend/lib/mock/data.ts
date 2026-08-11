import type { DashboardData, Symptom, Visit } from "@/types";
import { DEMO_CONFIG } from "./config";

export const MOCK_SYMPTOMS: Symptom[] = [
  {
    id: "sym-001",
    userId: DEMO_CONFIG.user.id,
    rawText:
      "I get this really bad pain in my lower stomach and pelvis especially around my period. It's been going on for maybe a year. Nothing really helps, even ibuprofen. It's like a deep cramping that sometimes shoots down my legs.",
    clinicalText:
      "Patient reports severe dysmenorrhea with associated pelvic pain for approximately 12 months. Pain is described as deep and cramping, with radiation to the bilateral lower extremities. Severity rated 8/10. Not relieved by NSAIDs.",
    bodyLocation: "Lower abdomen / pelvis",
    symptomType: "Pelvic pain / Dysmenorrhea",
    duration: "~12 months",
    severity: 8,
    onsetPattern: "Cyclical, menstrual correlation",
    aggravatingFactors: ["Menstruation", "Physical activity"],
    relievingFactors: [],
    loggedAt: "2024-01-20T09:14:00Z",
  },
  {
    id: "sym-002",
    userId: DEMO_CONFIG.user.id,
    rawText:
      "I'm exhausted all the time. Even after sleeping 9 hours I wake up feeling like I haven't slept at all. It started around the same time as the pain. I also feel foggy and can't concentrate at work.",
    clinicalText:
      "Patient reports persistent fatigue and cognitive impairment for approximately 12 months, concurrent with onset of pelvic pain. Fatigue is not relieved by extended sleep. Functional impact rated 7/10.",
    bodyLocation: "Generalized",
    symptomType: "Fatigue / Cognitive impairment",
    duration: "~12 months",
    severity: 7,
    onsetPattern: "Persistent, concurrent with pain onset",
    aggravatingFactors: ["Work demands", "Poor sleep quality"],
    relievingFactors: [],
    loggedAt: "2024-01-20T09:28:00Z",
  },
  {
    id: "sym-003",
    userId: DEMO_CONFIG.user.id,
    rawText:
      "My stomach bloats really badly, especially in the week before my period. People have asked if I'm pregnant. It goes down after my period but comes right back next month.",
    clinicalText:
      "Patient reports cyclical abdominal bloating correlated with the premenstrual phase, approximately one week prior to menses. Symptom resolves post-menstrually and recurs each cycle. Severity rated 6/10.",
    bodyLocation: "Abdomen",
    symptomType: "Abdominal bloating",
    duration: "Recurring monthly",
    severity: 6,
    onsetPattern: "Cyclical, premenstrual",
    aggravatingFactors: ["Premenstrual week"],
    relievingFactors: ["After menstruation"],
    loggedAt: "2024-02-10T11:05:00Z",
  },
  {
    id: "sym-004",
    userId: DEMO_CONFIG.user.id,
    rawText:
      "My shoulders and hips ache constantly. Some days it's bad enough that I can't lift things. Started maybe 6 months ago. Worse in the morning.",
    clinicalText:
      "Patient reports bilateral shoulder and hip arthralgia of approximately 6 months duration, with morning stiffness as the primary aggravating pattern. Pain affects functional capacity for lifting. Severity rated 5/10.",
    bodyLocation: "Shoulders / hips",
    symptomType: "Joint pain / Arthralgia",
    duration: "~6 months",
    severity: 5,
    onsetPattern: "Persistent, worse in mornings",
    aggravatingFactors: ["Morning stiffness", "Lifting"],
    relievingFactors: [],
    loggedAt: "2024-03-05T16:40:00Z",
  },
];

export const MOCK_VISITS: Visit[] = [
  {
    id: "vis-001",
    userId: DEMO_CONFIG.user.id,
    visitDate: "2024-02-01",
    doctorName: "Dr. Rohan Mehta",
    specialty: "General Practitioner",
    notes:
      "Routine consultation. Doctor attributed pelvic pain to normal period cramps and fatigue to stress.",
    dismissalRate: 0.67,
    symptoms: [
      {
        symptomId: "sym-001",
        outcome: "dismissed",
        outcomeNote: "Told it was normal menstrual cramping. No investigation ordered.",
      },
      {
        symptomId: "sym-002",
        outcome: "partial",
        outcomeNote: "Attributed to work stress. Thyroid blood test ordered.",
      },
      {
        symptomId: "sym-003",
        outcome: "dismissed",
        outcomeNote: "Not addressed in appointment.",
      },
    ],
    createdAt: "2024-02-01T13:45:00Z",
  },
  {
    id: "vis-002",
    userId: DEMO_CONFIG.user.id,
    visitDate: "2024-03-18",
    doctorName: "Dr. Sunita Rao",
    specialty: "Gynaecologist",
    notes: "Referral from GP. Pelvic pain and bloating discussed. Ultrasound ordered.",
    dismissalRate: 0.5,
    symptoms: [
      {
        symptomId: "sym-001",
        outcome: "addressed",
        outcomeNote: "Ultrasound ordered. Possible endometriosis mentioned.",
      },
      {
        symptomId: "sym-003",
        outcome: "addressed",
        outcomeNote: "Linked to suspected endometriosis. Dietary diary requested.",
      },
      {
        symptomId: "sym-004",
        outcome: "dismissed",
        outcomeNote: "Not in scope for this appointment. Advised to return to GP.",
      },
      {
        symptomId: "sym-002",
        outcome: "dismissed",
        outcomeNote: "Not discussed.",
      },
    ],
    createdAt: "2024-03-18T10:25:00Z",
  },
];

export const MOCK_DASHBOARD: DashboardData = {
  totalSymptoms: 4,
  totalVisits: 2,
  overallDismissalRate: 0.57,
  dismissalByVisit: [
    { visitDate: "2024-02-01", doctorName: "Dr. Mehta", rate: 0.67, specialty: "GP" },
    {
      visitDate: "2024-03-18",
      doctorName: "Dr. Rao",
      rate: 0.5,
      specialty: "Gynaecologist",
    },
  ],
  mostDismissedSymptoms: [
    { symptomType: "Fatigue / Cognitive impairment", timesPresented: 2, timesDismissed: 2 },
    { symptomType: "Pelvic pain / Dysmenorrhea", timesPresented: 2, timesDismissed: 1 },
    { symptomType: "Abdominal bloating", timesPresented: 2, timesDismissed: 1 },
  ],
  dismissalTrend: [
    { visitDate: "2024-02-01", rate: 0.67 },
    { visitDate: "2024-03-18", rate: 0.5 },
  ],
};
