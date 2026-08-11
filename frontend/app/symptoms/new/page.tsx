"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Symptom } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationCard } from "@/components/symptoms/ConfirmationCard";
import { SymptomLogger } from "@/components/symptoms/SymptomLogger";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useAuth } from "@/lib/auth/useAuth";

export default function NewSymptomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { logSymptom, confirmSymptom } = useSymptoms(user?.id);
  const [extracted, setExtracted] = useState<Symptom | null>(null);

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-label uppercase text-muted">Guided intake</p>
        <h1 className="font-display text-display">Log a symptom</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SymptomLogger onExtract={async (rawText) => {
          const result = await logSymptom(rawText);
          setExtracted(result);
          return result;
        }} />
        {extracted ? (
          <ConfirmationCard
            symptom={extracted}
            onEditDescription={() => setExtracted(null)}
            onConfirm={async (symptom) => {
              await confirmSymptom(symptom);
              router.push("/symptoms");
            }}
          />
        ) : (
          <section className="card flex min-h-[320px] items-center justify-center p-6 text-center text-sm text-muted">
            The extracted clinical preview will appear here.
          </section>
        )}
      </div>
    </AppShell>
  );
}
