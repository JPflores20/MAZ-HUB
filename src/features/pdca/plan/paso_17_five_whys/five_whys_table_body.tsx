/**
 * @fileoverview Cuerpo tabular editable con columnas dinámicas de 1° a N° Por qué y sección de evidencias.
 */
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { AutoResizeTextarea } from "../../components/auto_resize_textarea";
import { cn } from "@/shared/utils/class_names";
import { SeccionEvidencias } from "./five_whys_evidences";
import { FiveWhysRowActions } from "./five_whys_row_actions";
import type { PropiedadesTablaCuerpo } from "./five_whys_types";

/**
 * Renderiza pares de filas (Pregunta q_k / Respuesta w_k) para cada causa analizada en 5 Why's.
 */
export function TablaCuerpo({
  filas_normalizadas,
  cantidad_porques,
  filas_subiendo,
  al_actualizar_fila,
  al_eliminar_fila,
  al_subir_evidencia,
}: PropiedadesTablaCuerpo) {
  const { t: translate } = useTranslation();

  return (
    <>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: cantidad_porques }).map((_columna, indice_col) => (
              <th
                key={`header-${indice_col}`}
                className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]"
              >
                {indice_col + 1}º POR QUÉ
              </th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">
              {translate("pdcaPlan.paso17_five_whys_root_cause")}
            </th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">
              ACCION(ES)
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {filas_normalizadas.map((fila_actual) => (
            <Fragment key={fila_actual.id}>
              <tr className="border-b border-white group">
                {Array.from({ length: cantidad_porques }).map((_pregunta, indice_col) => (
                  <td
                    key={`q-${indice_col}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      fila_actual.isRootCause === "Sí"
                        ? "bg-red-50 dark:bg-red-950/30"
                        : fila_actual.isRootCause === "No"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-blue-100 dark:bg-blue-900/20",
                    )}
                  >
                    <AutoResizeTextarea
                      value={String(fila_actual[`q${indice_col + 1}`] || "")}
                      onChange={(valor) =>
                        al_actualizar_fila(fila_actual.id, `q${indice_col + 1}`, valor)
                      }
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..."
                    />
                  </td>
                ))}
                <FiveWhysRowActions
                  fila={fila_actual}
                  puede_eliminar={filas_normalizadas.length > 1}
                  al_actualizar_fila={al_actualizar_fila}
                  al_eliminar_fila={al_eliminar_fila}
                />
              </tr>
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: cantidad_porques }).map((_respuesta, indice_col) => (
                  <td
                    key={`w-${indice_col}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      fila_actual.isRootCause === "Sí"
                        ? "bg-red-100 dark:bg-red-900/40"
                        : fila_actual.isRootCause === "No"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-[#E2E2E2] dark:bg-secondary",
                    )}
                  >
                    <AutoResizeTextarea
                      value={String(fila_actual[`w${indice_col + 1}`] || "")}
                      onChange={(valor) =>
                        al_actualizar_fila(fila_actual.id, `w${indice_col + 1}`, valor)
                      }
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..."
                    />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <SeccionEvidencias
        filas_normalizadas={filas_normalizadas}
        filas_subiendo={filas_subiendo}
        al_actualizar_fila={al_actualizar_fila}
        al_subir_evidencia={al_subir_evidencia}
      />
    </>
  );
}
