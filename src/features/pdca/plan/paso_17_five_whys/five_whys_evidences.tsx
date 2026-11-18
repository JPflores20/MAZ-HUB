/**
 * @fileoverview Gestor visual de evidencias fotográficas y PDFs asociadas a cada fila de 5 Porqués.
 */
import { useTranslation } from "react-i18next";
import { UploadCloud, FileText, X, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/class_names";
import { sanitize_external_url } from "@/core/security";
import type { PropiedadesSeccionEvidencias } from "./five_whys_types";

/**
 * Muestra tarjetas de subida para validar con evidencia documental las acciones/causas raíz detectadas.
 */
export function SeccionEvidencias({
  filas_normalizadas,
  filas_subiendo,
  al_actualizar_fila,
  al_subir_evidencia,
}: PropiedadesSeccionEvidencias) {
  const { t: translate } = useTranslation();

  const filas_con_accion = filas_normalizadas.filter(
    (fila_actual) => fila_actual.accion && fila_actual.accion.trim() !== "",
  );

  return (
    <div className="mt-6 p-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">
        {translate("pdcaPlan.paso17_five_whys_evidences")}
      </h4>
      {filas_con_accion.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          {translate("pdcaPlan.paso17_five_whys_no_actions")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filas_con_accion.map((fila_actual, indice_evidencia) => {
            const url_evidencia_segura = sanitize_external_url(fila_actual.evidencia, {
              allowDataMedia: true,
            });
            const esta_subiendo = filas_subiendo.has(fila_actual.id);
            const es_causa_raiz = fila_actual.isRootCause === "Sí";
            const es_descartada = fila_actual.isRootCause === "No";

            const clase_tarjeta = cn(
              "flex flex-col border rounded-xl p-3",
              es_causa_raiz
                ? "bg-red-50 dark:bg-red-900/20 border-red-200"
                : es_descartada
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                  : "bg-white border-border",
            );

            const clase_zona_subida = cn(
              "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group",
              es_causa_raiz
                ? "bg-red-100/50 border-red-300"
                : es_descartada
                  ? "bg-green-100/50 border-green-300"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200",
            );

            return (
              <div key={fila_actual.id} className={clase_tarjeta}>
                <p
                  className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                  title={fila_actual.accion}
                >
                  {indice_evidencia + 1}. {fila_actual.accion}
                </p>
                <div className={clase_zona_subida}>
                  {url_evidencia_segura ? (
                    <>
                      {url_evidencia_segura.includes("application/pdf") ? (
                        <a
                          href={url_evidencia_segura}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:bg-red-900/20"
                        >
                          <FileText className="size-8 mr-2" /> PDF
                        </a>
                      ) : (
                        <img
                          src={url_evidencia_segura}
                          alt={`Evidencia ${indice_evidencia + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => al_actualizar_fila(fila_actual.id, "evidencia", "")}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : esta_subiendo ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <RefreshCw className="size-6 mb-1 animate-spin" />
                      <span className="text-[10px] uppercase font-semibold">
                        {translate("pdcaPlan.paso14_rendimiento_uploading")}
                      </span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                      <UploadCloud className="size-6 mb-1" />
                      <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        className="hidden"
                        onChange={async (evento) => {
                          const archivo = evento.target.files?.[0];
                          if (archivo) await al_subir_evidencia(fila_actual.id, archivo);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
