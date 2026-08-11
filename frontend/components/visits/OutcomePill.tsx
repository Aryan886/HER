import type { VisitOutcome } from "@/types";

const labels: Record<VisitOutcome, string> = {
  addressed: "Addressed",
  partial: "Partial",
  dismissed: "Dismissed",
};

const colors: Record<VisitOutcome, string> = {
  addressed: "bg-sage text-white",
  partial: "bg-amber text-white",
  dismissed: "bg-rose text-white",
};

export function OutcomePill({ outcome }: { outcome: VisitOutcome }) {
  return (
    <span className={`inline-flex rounded-pill px-3 py-1 text-xs font-semibold ${colors[outcome]}`}>
      {labels[outcome]}
    </span>
  );
}
