export function SeverityBadge({ value }: { value: number | null }) {
  const normalized = value ?? 0;
  const color = normalized >= 8 ? "bg-rose" : normalized >= 6 ? "bg-amber" : "bg-sage";

  return (
    <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-white px-3 py-1 text-sm font-semibold">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
      {value ? `${value}/10` : "Not set"}
    </span>
  );
}
