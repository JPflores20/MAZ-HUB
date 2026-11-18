/**
 * @fileoverview Cuadrícula de subida y vista previa de evidencias asociadas a pruebas ejecutadas (Paso 24).
 */
import React, { useState } from "react";
import { X, UploadCloud, RefreshCw, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils/class_names";
import type { PruebaEjecutadaItem } from "@/domain/pdca";
import { upload_validated_evidence_file } from "@/shared/services/storage/storage_upload_service";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesEvidenciasPruebas {
  pruebas: PruebaEjecutadaItem[];
  al_actualizar_evidencia: (prueba_id: string, url_evidencia: string) => void;
}

async function subir_evidencia_prueba(archivo: File): Promise<string> {
  return upload_validated_evidence_file(archivo, "pruebas_ejecutadas_evidencias", {
    compress_images: true,
    max_width: 2048,
    quality: 0.85,
    preserve_png: false,
    allow_office_documents: true,
  });
}

/**
 * Muestra las tarjetas de evidencia fotográfica o PDF correspondientes a cada prueba con nombre definido.
 */
export const PruebasEvidenciaGrid: React.FC<PropiedadesEvidenciasPruebas> = ({
  pruebas,
  al_actualizar_evidencia,
}) => {
  const { t: translate } = useTranslation();
  const [filas_subiendo, set_filas_subiendo] = useState<Set<string>>(new Set());

  const pruebas_con_titulo = pruebas.filter((prueba_actual) => prueba_actual.prueba.trim() !== "");
  if (pruebas_con_titulo.length === 0) return null;

  const manejar_carga_archivo = async (prueba_id: string, archivo: File) => {
    try {
      set_filas_subiendo((previo) => new Set(previo).add(prueba_id));
      const url_descarga = await subir_evidencia_prueba(archivo);
      al_actualizar_evidencia(prueba_id, url_descarga);
    } catch (error_subida) {
      console.error("Error subiendo evidencia:", error_subida);
    } finally {
      set_filas_subiendo((previo) => {
        const siguiente = new Set(previo);
        siguiente.delete(prueba_id);
        return siguiente;
      });
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">
        {translate("pdcaTables.executedTests.evidencesTitle")}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pruebas_con_titulo.map((prueba_actual, indice_prueba) => {
          const url_segura = sanitize_external_url(prueba_actual.evidencia, { allowDataMedia: true });
          const esta_subiendo = filas_subiendo.has(prueba_actual.id);
          const clase_dropzone = cn(
            "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 dark:bg-slate-900 border-slate-200",
          );

          return (
            <div key={prueba_actual.id} className="flex flex-col border rounded-xl p-3 bg-white border-border">
              <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={prueba_actual.prueba}>
                {indice_prueba + 1}. {prueba_actual.prueba}
              </p>
              <div className={clase_dropzone}>
                {url_segura ? (
                  <>
                    {url_segura.includes("application/pdf") ? (
                      <a
                        href={url_segura}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:bg-red-900/20"
                      >
                        <FileText className="size-8 mr-2" /> PDF
                      </a>
                    ) : (
                      <img
                        src={url_segura}
                        alt={`Evidencia ${indice_prueba + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => al_actualizar_evidencia(prueba_actual.id, "")}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : esta_subiendo ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <RefreshCw className="size-6 mb-1 animate-spin" />
                    <span className="text-[10px] uppercase font-semibold">
                      {translate("pdcaTables.executedTests.uploading")}
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                    <UploadCloud className="size-6 mb-1" />
                    <span className="text-[10px] uppercase font-semibold">
                      {translate("pdcaTables.executedTests.uploadPhotoPdf")}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(evento) => {
                        const archivo = evento.target.files?.[0];
                        if (archivo) void manejar_carga_archivo(prueba_actual.id, archivo);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
