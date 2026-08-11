"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import type { Symptom } from "@/types";
import { PulseDivider } from "@/components/ui/PulseDivider";

export function ConfirmationCard({
  symptom,
  onEditDescription,
  onConfirm,
}: {
  symptom: Symptom;
  onEditDescription: () => void;
  onConfirm: (symptom: Symptom) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Symptom>(symptom);
  const [saving, setSaving] = useState(false);
  const [aggravatingInput, setAggravatingInput] = useState("");
  const [relievingInput, setRelievingInput] = useState("");

  const fillPercent = useMemo(() => `${((draft.severity || 1) - 1) * 11.11}%`, [draft.severity]);

  const row = (label: string, content: React.ReactNode) => (
    <div className="grid gap-2 border-b border-border py-3 sm:grid-cols-[180px_1fr]">
      <dt className="flex items-center gap-2 text-label text-muted">
        <CheckCircle2 className="h-4 w-4 text-sage" aria-hidden="true" />
        {label}
      </dt>
      <dd>{content}</dd>
    </div>
  );

  return (
    <section className="card animate-[fadeIn_300ms_ease-out] p-5">
      <h2 className="font-display text-title">What we extracted</h2>
      <dl className="mt-3">
        {row("Body location", <span>{draft.bodyLocation || <span className="text-muted">-</span>}</span>)}
        {row("Symptom type", <span>{draft.symptomType || <span className="text-muted">-</span>}</span>)}
        {row(
          "Duration",
          <input
            className="field max-w-sm"
            value={draft.duration || ""}
            placeholder="Add duration"
            onChange={(event) => setDraft({ ...draft, duration: event.target.value })}
          />,
        )}
        {row(
          "Severity",
          <div>
            <div className="flex items-center gap-3">
              <input
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={draft.severity || 1}
                type="range"
                min={1}
                max={10}
                value={draft.severity || 1}
                onChange={(event) => setDraft({ ...draft, severity: Number(event.target.value) })}
                className="h-2 w-full max-w-sm appearance-none rounded-pill"
                style={{
                  background: `linear-gradient(90deg, var(--color-sage), var(--color-rose) ${fillPercent}, var(--color-rose-muted) ${fillPercent})`,
                }}
              />
              <span className="font-mono text-sm">{draft.severity || 1}/10</span>
            </div>
          </div>,
        )}
        {row(
          "Onset pattern",
          <input
            className="field max-w-sm"
            value={draft.onsetPattern || ""}
            placeholder="Add onset pattern"
            onChange={(event) => setDraft({ ...draft, onsetPattern: event.target.value })}
          />,
        )}
        {row(
          "Makes it worse",
          <div className="flex flex-wrap items-center gap-2">
            {draft.aggravatingFactors.map((factor) => (
              <span key={factor} className="rounded-pill bg-rose-light px-3 py-1 text-sm">
                {factor}
              </span>
            ))}
            <input
              className="field max-w-[180px]"
              placeholder="+ Add factor"
              value={aggravatingInput}
              onChange={(event) => setAggravatingInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && aggravatingInput.trim()) {
                  event.preventDefault();
                  setDraft({ ...draft, aggravatingFactors: [...draft.aggravatingFactors, aggravatingInput.trim()] });
                  setAggravatingInput("");
                }
              }}
            />
          </div>,
        )}
        {row(
          "Makes it better",
          <div className="flex flex-wrap items-center gap-2">
            {draft.relievingFactors.map((factor) => (
              <span key={factor} className="rounded-pill bg-rose-light px-3 py-1 text-sm">
                {factor}
              </span>
            ))}
            <input
              className="field max-w-[180px]"
              placeholder="+ Add factor"
              value={relievingInput}
              onChange={(event) => setRelievingInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && relievingInput.trim()) {
                  event.preventDefault();
                  setDraft({ ...draft, relievingFactors: [...draft.relievingFactors, relievingInput.trim()] });
                  setRelievingInput("");
                }
              }}
            />
          </div>,
        )}
      </dl>

      <PulseDivider />

      <div>
        <p className="text-label text-muted">Clinical record preview</p>
        <div className="mt-2 rounded-input border border-border bg-rose-light/40 p-3 font-mono text-mono">
          {draft.clinicalText}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onEditDescription}>
          Edit description
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onConfirm(draft);
            } finally {
              setSaving(false);
            }
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving..." : "Confirm & save"}
        </button>
      </div>
    </section>
  );
}
