/**
 * usabilidad_header_banner.tsx
 * Banner de encabezado para la sección "Usabilidad de Herramientas (5Ws y RDAs)",
 * con acciones para importar archivos Excel de Interaction Log y restaurar la base original.
 */
import React, { useRef } from "react";
import { FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropiedadesHeaderUsabilidad {
  conteo_registros_personalizados: number;
  on_importar_archivo_excel: (archivo: File) => Promise<number>;
  on_limpiar_importados: () => void;
}

export function UsabilidadHeaderBanner({
  conteo_registros_personalizados,
  on_importar_archivo_excel,
  on_limpiar_importados,
}: PropiedadesHeaderUsabilidad) {
  const referencia_input_archivo = useRef<HTMLInputElement>(null);

  const manejar_cambio_archivo = async (
    evento_cambio: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const archivo_seleccionado = evento_cambio.target.files?.[0];
    if (archivo_seleccionado) {
      await on_importar_archivo_excel(archivo_seleccionado);
      evento_cambio.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#162a52] text-white p-6 rounded-2xl shadow-lg border border-slate-800">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <FileSpreadsheet className="size-4" />
          Código VPO: MA-ZAC-VPOQ-A5-001 · Pilar Gestión / Solución de Problemas
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Análisis de Uso de Herramientas de Gestión (5Ws y RDAs)
        </h1>
        <p className="text-sm text-blue-100/80 mt-1">
          Monitoreo de usabilidad 5W / RDA / PDCA, efectividad del Ciclo SDCA,
          seguimiento de Deudores y Evaluación de Calidad IAL.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <input
          ref={referencia_input_archivo}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={manejar_cambio_archivo}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => referencia_input_archivo.current?.click()}
        >
          <Upload className="size-4 mr-2" />
          Importar Excel (IAL / 5Ws)
        </Button>
        {conteo_registros_personalizados > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-amber-300 hover:text-amber-200 hover:bg-white/10"
            onClick={on_limpiar_importados}
            title="Limpiar registros importados manualmente"
          >
            <RotateCcw className="size-4 mr-1.5" />
            Restaurar Base ({conteo_registros_personalizados})
          </Button>
        )}
      </div>
    </div>
  );
}
