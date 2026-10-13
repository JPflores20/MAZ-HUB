import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfDownloadButton({
  onExport,
  disabled,
}: {
  onExport?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs shadow-sm font-semibold"
    >
      <Download className="size-4" />
      Exportar PDF
    </Button>
  );
}
