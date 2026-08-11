import type { DashboardData, LogVisitPayload, SummaryData, Symptom, Visit } from "@/types";
import { DEMO_CONFIG } from "./config";
import { MOCK_DASHBOARD, MOCK_SYMPTOMS, MOCK_VISITS } from "./data";

let symptoms = [...MOCK_SYMPTOMS];
let visits = [...MOCK_VISITS];

const simulateDelay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

function recalculateDashboard(userId: string): DashboardData {
  const userSymptoms = symptoms.filter((symptom) => symptom.userId === userId);
  const userVisits = visits.filter((visit) => visit.userId === userId);
  const presented = userVisits.flatMap((visit) => visit.symptoms);
  const dismissed = presented.filter((item) => item.outcome === "dismissed").length;
  const byType = new Map<string, { symptomType: string; timesPresented: number; timesDismissed: number }>();

  presented.forEach((item) => {
    const symptom = userSymptoms.find((candidate) => candidate.id === item.symptomId);
    if (!symptom) return;
    const key = symptom.symptomType || "Unspecified symptom";
    const current = byType.get(key) || { symptomType: key, timesPresented: 0, timesDismissed: 0 };
    current.timesPresented += 1;
    if (item.outcome === "dismissed") current.timesDismissed += 1;
    byType.set(key, current);
  });

  return {
    ...MOCK_DASHBOARD,
    totalSymptoms: userSymptoms.length,
    totalVisits: userVisits.length,
    overallDismissalRate: presented.length ? dismissed / presented.length : 0,
    dismissalByVisit: userVisits.map((visit) => ({
      visitDate: visit.visitDate,
      doctorName: visit.doctorName.replace(/^Dr\. /, "Dr. "),
      specialty: visit.specialty,
      rate: visit.dismissalRate,
    })),
    mostDismissedSymptoms: Array.from(byType.values()).sort(
      (a, b) => b.timesDismissed - a.timesDismissed,
    ),
    dismissalTrend: userVisits.map((visit) => ({
      visitDate: visit.visitDate,
      rate: visit.dismissalRate,
    })),
  };
}

function generateMockClinicalRewrite(userId: string, rawText: string): Symptom {
  const lower = rawText.toLowerCase();
  const isFatigue = lower.includes("tired") || lower.includes("fatigue") || lower.includes("exhaust");
  const isBloating = lower.includes("bloat") || lower.includes("stomach");
  const isJoint = lower.includes("joint") || lower.includes("shoulder") || lower.includes("hip");
  const severity = lower.includes("severe") || lower.includes("bad") ? 8 : isJoint ? 5 : 6;

  return {
    id: `sym-${Date.now()}`,
    userId,
    rawText,
    clinicalText: `Patient reports ${
      isFatigue
        ? "persistent fatigue with cognitive impact"
        : isBloating
          ? "abdominal bloating with cyclical pattern"
          : isJoint
            ? "musculoskeletal pain affecting daily function"
            : "pain symptoms requiring clinical review"
    }. Description provided in patient language. Estimated severity ${severity}/10. Duration and triggers should be confirmed during appointment.`,
    bodyLocation: isFatigue ? "Generalized" : isBloating ? "Abdomen" : isJoint ? "Joints" : "Patient reported area",
    symptomType: isFatigue
      ? "Fatigue / Cognitive impairment"
      : isBloating
        ? "Abdominal bloating"
        : isJoint
          ? "Joint pain / Arthralgia"
          : "Pain / Unspecified symptom",
    duration: null,
    severity,
    onsetPattern: null,
    aggravatingFactors: [],
    relievingFactors: [],
    loggedAt: new Date().toISOString(),
  };
}

export async function mockGetSymptoms(userId: string): Promise<Symptom[]> {
  await simulateDelay(500);
  return symptoms.filter((symptom) => symptom.userId === userId);
}

export async function mockLogSymptom(userId: string, rawText: string): Promise<Symptom> {
  await simulateDelay(900);
  return generateMockClinicalRewrite(userId, rawText);
}

export async function mockConfirmSymptom(symptom: Symptom): Promise<Symptom> {
  await simulateDelay(350);
  symptoms = [symptom, ...symptoms.filter((item) => item.id !== symptom.id)];
  return symptom;
}

export async function mockGetVisits(userId: string): Promise<Visit[]> {
  await simulateDelay(500);
  return visits.filter((visit) => visit.userId === userId);
}

export async function mockLogVisit(userId: string, payload: LogVisitPayload): Promise<Visit> {
  await simulateDelay(700);
  const total = payload.symptoms.length || 1;
  const dismissed = payload.symptoms.filter((item) => item.outcome === "dismissed").length;
  const visit: Visit = {
    id: `vis-${Date.now()}`,
    userId,
    visitDate: payload.visitDate,
    doctorName: payload.doctorName,
    specialty: payload.specialty,
    notes: payload.notes || null,
    dismissalRate: dismissed / total,
    symptoms: payload.symptoms.map((item) => ({
      symptomId: item.symptomId,
      outcome: item.outcome,
      outcomeNote: item.outcomeNote || null,
    })),
    createdAt: new Date().toISOString(),
  };
  visits = [visit, ...visits];
  return visit;
}

export async function mockGetDashboard(userId: string): Promise<DashboardData> {
  await simulateDelay(500);
  return recalculateDashboard(userId);
}

export async function mockGenerateSummary(userId = DEMO_CONFIG.user.id): Promise<SummaryData> {
  await simulateDelay(600);
  const userVisits = visits.filter((visit) => visit.userId === userId);
  const presented = userVisits.flatMap((visit) => visit.symptoms);
  const totalDismissed = presented.filter((item) => item.outcome === "dismissed").length;
  return {
    narrativeSummary: null,
    symptomTimeline: symptoms.filter((symptom) => symptom.userId === userId),
    visitHistory: userVisits,
    dismissalSummary: {
      totalDismissed,
      totalPresented: presented.length,
      rate: presented.length ? totalDismissed / presented.length : 0,
    },
  };
}
