"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SymptomCard } from "@/components/symptoms/SymptomCard";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useAuth } from "@/lib/auth/useAuth";

export default function SymptomsPage() {
  const { user } = useAuth();
  const { symptoms, loading } = useSymptoms(user?.id);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label uppercase text-muted">Symptom log</p>
          <h1 className="font-display text-display">Symptoms</h1>
        </div>
        <Link href="/symptoms/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log a symptom
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading symptoms" />
      ) : symptoms.length ? (
        <div className="space-y-5">
          {symptoms.map((symptom) => (
            <SymptomCard key={symptom.id} symptom={symptom} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No symptoms recorded yet"
          description="Start with patient language. HER will structure it into a clinical record for appointments."
          ctaLabel="Log a symptom"
          ctaHref="/symptoms/new"
        />
      )}
    </AppShell>
  );
}
