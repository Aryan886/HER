"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "her-demo-banner-dismissed";

export function DemoModeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.sessionStorage.getItem(KEY) !== "true");
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-rose-muted bg-rose-light px-4 py-2 text-sm text-graphite">
      <span>
        Demo mode - mock data is active until <code>NEXT_PUBLIC_API_URL</code> is connected.
      </span>
      <button
        aria-label="Dismiss demo notice"
        className="rounded-btn p-1 text-muted hover:bg-white hover:text-graphite focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
        onClick={() => {
          window.sessionStorage.setItem(KEY, "true");
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
