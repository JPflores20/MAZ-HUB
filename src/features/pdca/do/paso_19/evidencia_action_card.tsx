/**
 * @fileoverview Tarjeta individual de evidencias fotográficas o PDF ligadas a una acción del plan.
 */
import React from "react";
import { UploadCloud, X, FileText, Plus } from "lucide-react";
import type { ActionItem } from "@/domain/pdca";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesTarjetaEvidencia {
  accion: ActionItem;
  indice_accion: number;
  urls_evidencia: string[];
  al_subir_archivos: (accion_id: string, evento: React.ChangeEvent<HTMLInputElement>) => void;
  al_eliminar_imagen: (accion_id: string, indice_imagen: number) => void;
}

/**
 * Renderiza el contenedor de vista previa y carga múltiple de evidencias para una acción específica.
 */
export function EvidenciaActionCard({
  accion,
  indice_accion,
  urls_evidencia,
  al_subir_archivos,
  al_eliminar_imagen,
}: PropiedadesTarjetaEvidencia) {
  const etiqueta_accion = `${accion.accion || "Sin acción"} - ${accion.resultados || "Sin solución/resultado"}`;

  return (
    <div className="flex flex-col border border-border rounded-xl p-3 bg-white">
      <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2 text-justify" title={etiqueta_accion}>
        {indice_accion + 1}. {etiqueta_accion}
      </p>
      <div className="relative mt-auto min-h-32 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-lg flex flex-col justify-center overflow-hidden group">
        {urls_evidencia.length > 0 ? (
          <div className={`grid gap-1.5 p-2 ${urls_evidencia.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {urls_evidencia.map((url_cruda, indice_imagen) => {
              const url_segura = sanitize_external_url(url_cruda, { allowDataMedia: true });
              if (!url_segura) return null;
              const es_pdf =
                url_segura.startsWith("data:application/pdf") ||
                url_segura.toLowerCase().includes(".pdf");

              return (
                <div
                  key={`${accion.id}-ev-${indice_imagen}`}
                  className="relative h-24 rounded border border-border/60 bg-white overflow-hidden flex items-center justify-center group/item"
                >
                  {es_pdf ? (
                    <div className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
                      <FileText className="size-6 mb-1" />
                      <a
                        href={url_segura}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] underline hover:text-blue-800 font-semibold"
                        onClick={(evento) => evento.stopPropagation()}
                      >
                        Ver PDF {indice_imagen + 1}
                      </a>
                    </div>
                  ) : (
                    <img
                      src={url_segura}
                      alt={`Evidencia ${indice_accion + 1} - ${indice_imagen + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => al_eliminar_imagen(accion.id, indice_imagen)}
                    className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}

            <label className="h-24 rounded border border-dashed border-slate-300 bg-white/60 hover:bg-white flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-primary transition">
              <Plus className="size-5 mb-0.5" />
              <span className="text-[9px] uppercase font-bold">Agregar más</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                className="hidden"
                onChange={(evento) => al_subir_archivos(accion.id, evento)}
              />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
            <UploadCloud className="size-6 mb-1" />
            <span className="text-[10px] uppercase font-semibold">Subir Foto</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(evento) => al_subir_archivos(accion.id, evento)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
