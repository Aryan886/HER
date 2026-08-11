import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, ctaLabel, ctaHref, icon }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 scale-150 rounded-full bg-rose-light" />
        <div className="relative rounded-full bg-white p-3 text-rose shadow-card">
          {icon || <PlusCircle className="h-7 w-7" aria-hidden="true" />}
        </div>
      </div>
      <h2 className="font-display text-title">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="btn-primary mt-5">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
