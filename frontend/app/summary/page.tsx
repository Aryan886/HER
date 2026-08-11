"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PDFExportButton } from "@/components/summary/PDFExportButton";
import { PulseDivider } from "@/components/ui/PulseDivider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { OutcomePill } from "@/components/visits/OutcomePill";
import { SeverityBadge } from "@/components/symptoms/SeverityBadge";
import { apiGenerateSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth/useAuth";
import type { SummaryData } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export default function SummaryPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    apiGenerateSummary(user.id)
      .then((data) => {
        setSummary(data);
        setLastGenerated(new Date().toLocaleString());
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const dateRange = useMemo(() => {
    if (!summary?.symptomTimeline.length) return "No symptoms logged yet";
    const sorted = [...summary.symptomTimeline].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
    );
    return `Symptoms logged from ${formatDate(sorted[0].loggedAt)} to ${formatDate(sorted[sorted.length - 1].loggedAt)}`;
  }, [summary]);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label uppercase text-muted">A record you can take to any appointment</p>
          <h1 className="font-display text-display">Clinical Summary</h1>
        </div>
        {summary ? (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <PDFExportButton summary={summary} />
            <p className="text-caption text-muted">Last generated: {lastGenerated || "Never"}</p>
          </div>
        ) : null}
      </div>

      {loading || !summary ? (
        <LoadingSpinner label="Generating summary" />
      ) : (
        <div className="space-y-6">
          <section className="card p-5">
            <p className="text-label uppercase text-muted">Patient record</p>
            <h2 className="mt-2 font-display text-title">{user?.name}</h2>
            <p className="mt-2 text-sm text-muted">{dateRange}</p>
            <p className="mt-1 text-sm text-muted">{summary.symptomTimeline.length} total symptoms</p>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-title">Symptom Timeline</h2>
            <div className="mt-5 border-l border-rose-muted pl-5">
              {summary.symptomTimeline
                .slice()
                .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
                .map((symptom) => (
                  <article key={symptom.id} className="relative pb-6">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-rose" aria-hidden="true" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-label text-muted">{formatDate(symptom.loggedAt)}</p>
                        <h3 className="mt-1 font-semibold">{symptom.symptomType}</h3>
                        <p className="text-sm text-muted">{symptom.bodyLocation}</p>
                      </div>
                      <SeverityBadge value={symptom.severity} />
                    </div>
                    <p className="mt-3 rounded-input border border-border bg-rose-light/30 p-3 font-mono text-mono">
                      {symptom.clinicalText}
                    </p>
                  </article>
                ))}
            </div>
          </section>

          <PulseDivider />

          <section className="card p-5">
            <h2 className="font-display text-title">Visit History with Outcomes</h2>
            <div className="mt-5 space-y-4">
              {summary.visitHistory.map((visit) => (
                <article key={visit.id} className="rounded-input border border-border bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-label text-muted">{formatDate(visit.visitDate)}</p>
                      <h3 className="font-semibold">{visit.doctorName}</h3>
                      <p className="text-sm text-muted">{visit.specialty}</p>
                    </div>
                    <p className="font-mono text-sm text-rose">{Math.round(visit.dismissalRate * 100)}% dismissed</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visit.symptoms.map((item) => (
                      <OutcomePill key={`${visit.id}-${item.symptomId}`} outcome={item.outcome} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-title">Dismissal Summary</h2>
            <p className="mt-3 text-body">
              {summary.dismissalSummary.totalDismissed} of {summary.dismissalSummary.totalPresented} reported symptoms
              were dismissed or not addressed across {summary.visitHistory.length} visits.
            </p>
            {summary.narrativeSummary ? (
              <p className="mt-4 rounded-input border border-border bg-rose-light/30 p-4 text-sm">
                {summary.narrativeSummary}
              </p>
            ) : null}
          </section>
        </div>
      )}
    </AppShell>
  );
}
