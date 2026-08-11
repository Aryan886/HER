"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { VisitCard } from "@/components/visits/VisitCard";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useVisits } from "@/hooks/useVisits";
import { useAuth } from "@/lib/auth/useAuth";

export default function VisitsPage() {
  const { user } = useAuth();
  const { visits, loading: visitsLoading } = useVisits(user?.id);
  const { symptoms, loading: symptomsLoading } = useSymptoms(user?.id);
  const loading = visitsLoading || symptomsLoading;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label uppercase text-muted">Visit history</p>
          <h1 className="font-display text-display">Doctor Visits</h1>
        </div>
        <Link href="/visits/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log a visit
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading visits" />
      ) : visits.length ? (
        <div className="space-y-5">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} symptoms={symptoms} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No visits recorded yet"
          description="Log appointments and map each discussed symptom to the outcome you heard."
          ctaLabel="Log a visit"
          ctaHref="/visits/new"
        />
      )}
    </AppShell>
  );
}
