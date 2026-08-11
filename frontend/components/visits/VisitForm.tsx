"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import type { LogVisitPayload, Symptom, VisitOutcome } from "@/types";

interface VisitFormValues {
  visitDate: string;
  doctorName: string;
  specialty: string;
  notes?: string;
}

const specialties = [
  "GP",
  "Gynaecologist",
  "Cardiologist",
  "Rheumatologist",
  "Neurologist",
  "Dermatologist",
  "Psychiatrist",
  "Other",
];

const outcomes: VisitOutcome[] = ["addressed", "partial", "dismissed"];

export function VisitForm({
  symptoms,
  onSave,
}: {
  symptoms: Symptom[];
  onSave: (payload: LogVisitPayload) => Promise<void>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [outcomeBySymptom, setOutcomeBySymptom] = useState<Record<string, VisitOutcome>>({});
  const [noteBySymptom, setNoteBySymptom] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitFormValues>({
    defaultValues: {
      visitDate: new Date().toISOString().slice(0, 10),
      specialty: "GP",
    },
  });

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        const symptomRows = symptoms
          .filter((symptom) => selected[symptom.id])
          .map((symptom) => ({
            symptomId: symptom.id,
            outcome: outcomeBySymptom[symptom.id] || "dismissed",
            outcomeNote: noteBySymptom[symptom.id],
          }));
        setSaving(true);
        try {
          await onSave({ ...values, symptoms: symptomRows });
          router.push("/visits");
        } finally {
          setSaving(false);
        }
      })}
    >
      <section className="card grid gap-4 p-5 md:grid-cols-2">
        <div>
          <label htmlFor="visitDate" className="text-label text-muted">
            Visit date
          </label>
          <input id="visitDate" type="date" className="field mt-2" {...register("visitDate", { required: true })} />
          {errors.visitDate ? <p className="mt-1 text-caption text-rose">Visit date is required.</p> : null}
        </div>
        <div>
          <label htmlFor="doctorName" className="text-label text-muted">
            Doctor name
          </label>
          <input id="doctorName" className="field mt-2" {...register("doctorName", { required: true })} />
          {errors.doctorName ? <p className="mt-1 text-caption text-rose">Doctor name is required.</p> : null}
        </div>
        <div>
          <label htmlFor="specialty" className="text-label text-muted">
            Specialty
          </label>
          <select id="specialty" className="field mt-2" {...register("specialty", { required: true })}>
            {specialties.map((specialty) => (
              <option key={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="notes" className="text-label text-muted">
            Visit notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="field mt-2"
            placeholder="What happened in this visit?"
            {...register("notes")}
          />
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-title">Which symptoms did you discuss?</h2>
            <p className="text-sm text-muted">{selectedCount} selected for this visit.</p>
          </div>
        </div>

        {symptoms.length ? (
          <div className="mt-5 space-y-3">
            {symptoms.map((symptom) => {
              const checked = Boolean(selected[symptom.id]);
              return (
                <div key={symptom.id} className="rounded-input border border-border bg-white p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-rose"
                        checked={checked}
                        onChange={(event) =>
                          setSelected((current) => ({ ...current, [symptom.id]: event.target.checked }))
                        }
                      />
                      <span>
                        <span className="block font-semibold">{symptom.symptomType}</span>
                        <span className="block text-sm text-muted">{symptom.bodyLocation}</span>
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {outcomes.map((outcome) => (
                        <button
                          key={outcome}
                          type="button"
                          disabled={!checked}
                          className={`rounded-pill px-3 py-1 text-xs font-semibold capitalize transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            outcomeBySymptom[symptom.id] === outcome
                              ? "bg-rose text-white"
                              : "border border-border bg-white text-muted hover:bg-rose-light"
                          }`}
                          onClick={() => setOutcomeBySymptom((current) => ({ ...current, [symptom.id]: outcome }))}
                        >
                          {outcome}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    disabled={!checked}
                    className="field mt-3 disabled:bg-bg disabled:text-muted"
                    placeholder="Outcome note"
                    value={noteBySymptom[symptom.id] || ""}
                    onChange={(event) =>
                      setNoteBySymptom((current) => ({ ...current, [symptom.id]: event.target.value }))
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-input bg-rose-light p-3 text-sm text-muted">
            No symptoms logged yet. Record a symptom first before saving visit outcomes.
          </p>
        )}
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving || symptoms.length === 0}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving..." : "Save visit record"}
        </button>
      </div>
    </form>
  );
}
