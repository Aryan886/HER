"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DismissalChart } from "@/components/dashboard/DismissalChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopDismissedList } from "@/components/dashboard/TopDismissedList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/lib/auth/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const { dashboard, loading } = useDashboard(user?.id);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label uppercase text-muted">Dismissal dashboard</p>
          <h1 className="font-display text-display">Welcome back, {user?.name.split(" ")[0]}</h1>
        </div>
        <Link href="/symptoms/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log symptom
        </Link>
      </div>

      {loading || !dashboard ? (
        <LoadingSpinner label="Loading dashboard" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Overall dismissal"
              value={`${Math.round(dashboard.overallDismissalRate * 100)}%`}
              helper="Across all symptoms discussed in logged visits."
            />
            <StatCard label="Symptoms logged" value={`${dashboard.totalSymptoms}`} helper="Evidence entries ready for appointments." />
            <StatCard label="Doctor visits" value={`${dashboard.totalVisits}`} helper="Appointments with tracked outcomes." />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <DismissalChart data={dashboard.dismissalTrend} />
            <TopDismissedList data={dashboard.mostDismissedSymptoms} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
