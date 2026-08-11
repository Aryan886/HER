"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { VisitForm } from "@/components/visits/VisitForm";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useVisits } from "@/hooks/useVisits";
import { useAuth } from "@/lib/auth/useAuth";

export default function NewVisitPage() {
  const { user } = useAuth();
  const { symptoms, loading: symptomsLoading } = useSymptoms(user?.id);
  const { logVisit } = useVisits(user?.id);

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-label uppercase text-muted">Appointment evidence</p>
        <h1 className="font-display text-display">Log a visit</h1>
      </div>

      {symptomsLoading ? (
        <LoadingSpinner label="Loading symptoms" />
      ) : symptoms.length ? (
        <VisitForm symptoms={symptoms} onSave={logVisit} />
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="Record symptoms first"
            description="Visit outcomes are most useful once HER has symptom records to attach them to."
            ctaLabel="Log a symptom"
            ctaHref="/symptoms/new"
          />
          <Link href="/visits" className="btn-secondary">
            Back to visits
          </Link>
        </div>
      )}
    </AppShell>
  );
}
