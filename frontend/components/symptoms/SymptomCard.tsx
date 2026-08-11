import { CalendarDays, MapPin } from "lucide-react";
import type { Symptom } from "@/types";
import { PulseDivider } from "@/components/ui/PulseDivider";
import { SeverityBadge } from "./SeverityBadge";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function SymptomCard({ symptom }: { symptom: Symptom }) {
  return (
    <article className="card p-5 transition hover:border-rose-muted hover:shadow-elevated">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-title">{symptom.symptomType || "Unspecified symptom"}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {symptom.bodyLocation || "Location not inferred"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(symptom.loggedAt)}
            </span>
          </div>
        </div>
        <SeverityBadge value={symptom.severity} />
      </div>

      <PulseDivider />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-label uppercase text-muted">Patient words</p>
          <p className="mt-2 text-body">{symptom.rawText}</p>
        </div>
        <div className="rounded-input border border-border bg-rose-light/35 p-3">
          <p className="text-label uppercase text-muted">Clinical record</p>
          <p className="mt-2 font-mono text-mono">{symptom.clinicalText}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-label text-muted">Duration</dt>
          <dd className="font-semibold">{symptom.duration || "Needs confirmation"}</dd>
        </div>
        <div>
          <dt className="text-label text-muted">Onset</dt>
          <dd className="font-semibold">{symptom.onsetPattern || "Needs confirmation"}</dd>
        </div>
        <div>
          <dt className="text-label text-muted">Triggers</dt>
          <dd className="font-semibold">
            {symptom.aggravatingFactors.length ? symptom.aggravatingFactors.join(", ") : "None recorded"}
          </dd>
        </div>
      </dl>
    </article>
  );
}
