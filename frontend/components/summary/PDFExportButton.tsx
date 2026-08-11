"use client";

import { Download } from "lucide-react";
import type { SummaryData } from "@/types";
import { generateClinicalSummaryPdf } from "@/lib/pdf";

export function PDFExportButton({ summary }: { summary: SummaryData }) {
  return (
    <button className="btn-primary" onClick={() => generateClinicalSummaryPdf(summary)}>
      <Download className="h-4 w-4" aria-hidden="true" />
      Generate PDF
    </button>
  );
}
