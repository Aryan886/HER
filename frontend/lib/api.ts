import type { LogVisitPayload, Symptom } from "@/types";
import {
  mockConfirmSymptom,
  mockGenerateSummary,
  mockGetDashboard,
  mockGetSymptoms,
  mockGetVisits,
  mockLogSymptom,
  mockLogVisit,
} from "./mock/handlers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiLogSymptom(userId: string, rawText: string) {
  if (!BASE_URL) return mockLogSymptom(userId, rawText);
  const res = await fetch(`${BASE_URL}/api/symptoms/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, raw_text: rawText }),
  });
  if (!res.ok) throw new Error("Failed to log symptom");
  return res.json();
}

export async function apiConfirmSymptom(symptom: Symptom) {
  if (!BASE_URL) return mockConfirmSymptom(symptom);
  const res = await fetch(`${BASE_URL}/api/symptoms/${symptom.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(symptom),
  });
  if (!res.ok) throw new Error("Failed to confirm symptom");
  return res.json();
}

export async function apiGetSymptoms(userId: string) {
  if (!BASE_URL) return mockGetSymptoms(userId);
  const res = await fetch(`${BASE_URL}/api/symptoms/all?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch symptoms");
  return res.json();
}

export async function apiLogVisit(userId: string, payload: LogVisitPayload) {
  if (!BASE_URL) return mockLogVisit(userId, payload);
  const res = await fetch(`${BASE_URL}/api/visits/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ...payload }),
  });
  if (!res.ok) throw new Error("Failed to log visit");
  return res.json();
}

export async function apiGetVisits(userId: string) {
  if (!BASE_URL) return mockGetVisits(userId);
  const res = await fetch(`${BASE_URL}/api/visits/all?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch visits");
  return res.json();
}

export async function apiGetDashboard(userId: string) {
  if (!BASE_URL) return mockGetDashboard(userId);
  const res = await fetch(`${BASE_URL}/api/dashboard?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function apiGenerateSummary(userId: string) {
  if (!BASE_URL) return mockGenerateSummary(userId);
  const res = await fetch(`${BASE_URL}/api/summary/generate?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to generate summary");
  return res.json();
}
