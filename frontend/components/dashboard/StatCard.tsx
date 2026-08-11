interface StatCardProps {
  label: string;
  value: string;
  helper: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="card p-5">
      <p className="text-label uppercase text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl text-graphite">{value}</p>
      <p className="mt-2 text-sm text-muted">{helper}</p>
    </article>
  );
}
