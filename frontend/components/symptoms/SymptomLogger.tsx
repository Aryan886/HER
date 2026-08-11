"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Wand2 } from "lucide-react";
import type { Symptom } from "@/types";

interface FormValues {
  rawText: string;
}

export function SymptomLogger({
  onExtract,
}: {
  onExtract: (rawText: string) => Promise<Symptom>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { rawText: "" } });
  const rawText = watch("rawText") || "";

  return (
    <section className="card p-5">
      <div className="mb-4 border-l-[3px] border-rose bg-rose-light px-4 py-3">
        <p className="text-sm font-semibold">Write naturally, as if telling someone what happened.</p>
        <p className="mt-1 text-sm text-muted">
          Include where it is, how long it has been happening, severity, timing, and what makes it better or worse.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={handleSubmit(async (values) => {
          setSubmitting(true);
          try {
            await onExtract(values.rawText);
          } finally {
            setSubmitting(false);
          }
        })}
      >
        <div>
          <label htmlFor="rawText" className="text-label text-muted">
            Symptom description
          </label>
          <textarea
            id="rawText"
            rows={8}
            className="field mt-2 resize-y"
            placeholder="Example: I get a deep cramping pain around my period that sometimes shoots down my legs..."
            {...register("rawText", { minLength: 20, required: true })}
          />
          <div className="mt-2 flex items-center justify-between gap-4 text-caption text-muted">
            <span>{errors.rawText ? "Please enter at least 20 characters." : "Minimum 20 characters"}</span>
            <span>{rawText.length} characters</span>
          </div>
        </div>
        <button className="btn-primary ml-auto flex" type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
          {submitting ? "Analyzing..." : "Record symptom"}
        </button>
      </form>
    </section>
  );
}
