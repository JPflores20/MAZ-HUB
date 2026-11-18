/**
 * @fileoverview Galería de tarjetas para adjuntar evidencias fotográficas o PDF por cada PI (Paso 14).
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud, RefreshCw, FileText, X } from "lucide-react";
import { cn } from "@/shared/utils/class_names";
import type { RendimientoActualPiItem } from "@/domain/pdca";
import { sanitize_external_url } from "@/core/security";
import { subir_evidencia_rendimiento } from "./rendimiento_actual_upload";

interface PropiedadesEvidenciasRendimiento {
  registros_indicadores: RendimientoActualPiItem[];
  al_actualizar_registro: (
    registro_id: string,
    campo_modificado: keyof RendimientoActualPiItem,
    nuevo_valor: string,
  ) => void;
}

/**
 * Despliega zonas individuales de carga para los indicadores PI que tienen nombre asignado.
 */
export const EvidenciasRendimientoActual: React.FC<PropiedadesEvidenciasRendimiento> = ({
  registros_indicadores,
  al_actualizar_registro,
}) => {
  const { t: translate } = useTranslation();
  const [registros_subiendo, set_registros_subiendo] = useState<Set<string>>(new Set());

  const manejar_subida_local = async (
    evento: React.ChangeEvent<HTMLInputElement>,
    registro_id: string,
  ) => {
    const archivo_seleccionado = evento.target.files?.[0];
    if (!archivo_seleccionado) return;
    try {
      set_registros_subiendo((previos) => new Set(previos).add(registro_id));
      const url_descarga = await subir_evidencia_rendimiento(archivo_seleccionado);
      al_actualizar_registro(registro_id, "evidencia", url_descarga);
    } catch (error_subida) {
      console.error("Error subiendo evidencia:", error_subida);
    } finally {
      set_registros_subiendo((previos) => {
        const siguientes = new Set(previos);
        siguientes.delete(registro_id);
        return siguientes;
      });
    }
  };

  const elementos_con_nombre =
    registros_indicadores?.filter(
      (registro_item) => registro_item.nombreIndicador.trim() !== "",
    ) || [];

  if (elementos_con_nombre.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">
        {translate("pdcaPlan.paso14_rendimiento_evidences", "EVIDENCIAS POR INDICADOR")}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {elementos_con_nombre.map((registro_visible, indice_lista) => {
          const evidencia_segura = sanitize_external_url(registro_visible.evidencia, {
            allowDataMedia: true,
          });
          const esta_subiendo = registros_subiendo.has(registro_visible.id);

          return (
            <div
              key={registro_visible.id}
              className={cn("flex flex-col border rounded-xl p-3 bg-white border-border")}
            >
              <p
                className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                title={registro_visible.nombreIndicador}
              >
                {indice_lista + 1}. {registro_visible.nombreIndicador}
              </p>
              <div
                className={cn(
                  "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 border-slate-200",
                )}
              >
                {evidencia_segura ? (
                  <>
                    {evidencia_segura.includes("application/pdf") ? (
                      <a
                        href={evidencia_segura}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50"
                      >
                        <FileText className="size-8 mr-2" /> PDF
                      </a>
                    ) : (
                      <img
                        src={evidencia_segura}
                        alt={`Evidencia ${indice_lista + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        al_actualizar_registro(registro_visible.id, "evidencia", "")
                      }
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white shadow-sm"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : esta_subiendo ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <RefreshCw className="size-6 mb-1 animate-spin" />
                    <span className="text-[10px] uppercase font-semibold">
                      {translate("pdcaPlan.paso14_rendimiento_uploading", "Subiendo...")}
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
                      onChange={(evento) => void manejar_subida_local(evento, registro_visible.id)}
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
