"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Symptom, Visit } from "@/types";
import { OutcomePill } from "./OutcomePill";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

function rateClass(rate: number) {
  if (rate >= 0.6) return "text-rose bg-rose-light border-rose-muted";
  if (rate >= 0.35) return "text-amber bg-amber/10 border-amber/30";
  return "text-sage bg-sage/10 border-sage/30";
}

export function VisitCard({ visit, symptoms }: { visit: Visit; symptoms: Symptom[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="card p-5 transition hover:border-rose-muted hover:shadow-elevated">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label text-muted">{formatDate(visit.visitDate)}</p>
          <h2 className="mt-1 font-display text-title">{visit.doctorName}</h2>
          <span className="mt-2 inline-flex rounded-pill bg-rose-light px-3 py-1 text-xs font-semibold text-rose">
            {visit.specialty}
          </span>
        </div>
        <div className={`rounded-card border px-4 py-3 text-center ${rateClass(visit.dismissalRate)}`}>
          <p className="font-mono text-2xl font-semibold">{Math.round(visit.dismissalRate * 100)}%</p>
          <p className="text-caption">dismissal rate</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visit.symptoms.map((item) => {
          const symptom = symptoms.find((candidate) => candidate.id === item.symptomId);
          return (
            <div key={`${visit.id}-${item.symptomId}`} className="rounded-input border border-border bg-white p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold">{symptom?.symptomType || "Symptom no longer available"}</span>
                <OutcomePill outcome={item.outcome} />
              </div>
              {item.outcomeNote ? <p className="mt-2 text-sm text-muted">{item.outcomeNote}</p> : null}
            </div>
          );
        })}
      </div>

      {visit.notes ? (
        <div className="mt-4">
          <button className="btn-ghost px-0" onClick={() => setExpanded((current) => !current)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Hide visit notes" : "Show visit notes"}
          </button>
          {expanded ? <p className="mt-2 rounded-input bg-rose-light/40 p-3 text-sm">{visit.notes}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
