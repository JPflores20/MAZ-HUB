/**
 * @fileoverview Botón de acción reutilizable para disparar la exportación a PDF del Resumen PDCA.
 */
import { Download } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface PropiedadesBotonPdf {
  on_export?: (() => void) | undefined;
  disabled?: boolean | undefined;
}

/**
 * Renderiza el botón verde de exportación de reporte PDF ejecutivo.
 */
export default function PdfDownloadButton({ on_export, disabled }: PropiedadesBotonPdf) {
  return (
    <Button
      onClick={on_export}
      disabled={disabled}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs shadow-sm font-semibold"
    >
      <Download className="size-4" />
      Exportar PDF
    </Button>
  );
}
