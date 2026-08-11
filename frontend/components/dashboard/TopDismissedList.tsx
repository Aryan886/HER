import type { DashboardData } from "@/types";

export function TopDismissedList({ data }: { data: DashboardData["mostDismissedSymptoms"] }) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-title">Most Dismissed Symptoms</h2>
      <div className="mt-5 space-y-4">
        {data.map((item) => {
          const percent = item.timesPresented
            ? Math.round((item.timesDismissed / item.timesPresented) * 100)
            : 0;
          return (
            <div key={item.symptomType}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="font-semibold">{item.symptomType}</p>
                <p className="font-mono text-sm text-muted">
                  {item.timesDismissed}/{item.timesPresented}
                </p>
              </div>
              <div className="h-2 rounded-pill bg-rose-light">
                <div className="h-2 rounded-pill bg-rose" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
