import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-rose" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
