"use client";

import { useCallback, useEffect, useState } from "react";
import { apiConfirmSymptom, apiGetSymptoms, apiLogSymptom } from "@/lib/api";
import type { Symptom } from "@/types";

export function useSymptoms(userId?: string) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setSymptoms(await apiGetSymptoms(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load symptoms");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logSymptom = useCallback(
    async (rawText: string) => {
      if (!userId) throw new Error("Missing user");
      return apiLogSymptom(userId, rawText);
    },
    [userId],
  );

  const confirmSymptom = useCallback(
    async (symptom: Symptom) => {
      const saved = await apiConfirmSymptom(symptom);
      setSymptoms((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      return saved;
    },
    [],
  );

  return { symptoms, loading, error, refresh, logSymptom, confirmSymptom };
}
