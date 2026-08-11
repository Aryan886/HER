"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetVisits, apiLogVisit } from "@/lib/api";
import type { LogVisitPayload, Visit } from "@/types";

export function useVisits(userId?: string) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setVisits(await apiGetVisits(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load visits");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logVisit = useCallback(
    async (payload: LogVisitPayload) => {
      if (!userId) throw new Error("Missing user");
      const saved = await apiLogVisit(userId, payload);
      setVisits((current) => [saved, ...current]);
      return saved;
    },
    [userId],
  );

  return { visits, loading, error, refresh, logVisit };
}
