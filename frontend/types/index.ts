export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Symptom {
  id: string;
  userId: string;
  rawText: string;
  clinicalText: string;
  bodyLocation: string | null;
  symptomType: string | null;
  duration: string | null;
  severity: number | null;
  onsetPattern: string | null;
  aggravatingFactors: string[];
  relievingFactors: string[];
  loggedAt: string;
}

export type VisitOutcome = "addressed" | "partial" | "dismissed";

export interface VisitSymptomOutcome {
  symptomId: string;
  outcome: VisitOutcome;
  outcomeNote: string | null;
}

export interface Visit {
  id: string;
  userId: string;
  visitDate: string;
  doctorName: string;
  specialty: string;
  notes: string | null;
  dismissalRate: number;
  symptoms: VisitSymptomOutcome[];
  createdAt: string;
}

export interface DashboardData {
  totalSymptoms: number;
  totalVisits: number;
  overallDismissalRate: number;
  dismissalByVisit: {
    visitDate: string;
    doctorName: string;
    specialty: string;
    rate: number;
  }[];
  mostDismissedSymptoms: {
    symptomType: string;
    timesPresented: number;
    timesDismissed: number;
  }[];
  dismissalTrend: {
    visitDate: string;
    rate: number;
  }[];
}

export interface SummaryData {
  narrativeSummary: string | null;
  symptomTimeline: Symptom[];
  visitHistory: Visit[];
  dismissalSummary: {
    totalDismissed: number;
    totalPresented: number;
    rate: number;
  };
}

export interface LogVisitPayload {
  visitDate: string;
  doctorName: string;
  specialty: string;
  notes?: string;
  symptoms: {
    symptomId: string;
    outcome: VisitOutcome;
    outcomeNote?: string;
  }[];
}
