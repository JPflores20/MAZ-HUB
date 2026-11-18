/**
 * @fileoverview Módulo de Evaluación RD2D / ITF para auditar la madurez metodológica de cada proyecto PDCA.
 */
import React from "react";
import type { ItfR2d2Evaluation } from "@/domain/models/pdca";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
  CRITERIOS_EVALUACION_R2D2,
  OPCIONES_CALIFICACION_R2D2,
  type ClaveCriterioR2d2,
} from "./r2d2_criteria_config";

interface PropiedadesEvaluacionR2d2 {
  evaluation: ItfR2d2Evaluation;
  onChange: (nueva_evaluacion: ItfR2d2Evaluation) => void;
  disabled?: boolean | undefined;
  currentUser?: { name?: string; email?: string } | null | undefined;
}

/**
 * Permite calificar los 5 pilares R2D2+1, capturar retroalimentación y registrar la bitácora de evaluadores.
 */
export const PdcaItfR2d2: React.FC<PropiedadesEvaluacionR2d2> = ({
  evaluation,
  onChange,
  disabled,
  currentUser,
}) => {
  const actualizar_campo = (
    criterio: ClaveCriterioR2d2,
    campo: "check" | "score" | "comment",
    valor: boolean | number | string,
  ) => {
    const evaluadores_previos = Array.isArray(evaluation.evaluators) ? [...evaluation.evaluators] : [];
    const evaluadores_normalizados = evaluadores_previos.map((evaluador_actual) =>
      typeof evaluador_actual === "string"
        ? { name: evaluador_actual, timestamp: new Date().toISOString() }
        : evaluador_actual,
    );

    const nombre_evaluador = currentUser?.name || currentUser?.email || "";
    if (nombre_evaluador) {
      const indice_existente = evaluadores_normalizados.findIndex(
        (evaluador_actual) => evaluador_actual.name === nombre_evaluador,
      );
      const sello_tiempo = new Date().toISOString();
      if (indice_existente >= 0) {
        evaluadores_normalizados[indice_existente] = { name: nombre_evaluador, timestamp: sello_tiempo };
      } else {
        evaluadores_normalizados.push({ name: nombre_evaluador, timestamp: sello_tiempo });
      }
    }

    onChange({
      ...evaluation,
      evaluators: evaluadores_normalizados,
      [criterio]: {
        ...(evaluation[criterio] || { check: false, score: 0, comment: "" }),
        [campo]: valor,
      },
    });
  };

  const puntaje_total = Object.entries(evaluation).reduce((acumulado, [clave_entrada, valor_entrada]) => {
    if (clave_entrada === "evaluators" || !valor_entrada || typeof valor_entrada !== "object") {
      return acumulado;
    }
    const puntaje = (valor_entrada as { score?: number }).score ?? 0;
    return acumulado + puntaje * 5;
  }, 0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <div className="bg-blue-900 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold text-lg tracking-wide">PDCA / ITF R2D2 + 1</h3>
        <div className="bg-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Puntuación Total: {puntaje_total} / 100
        </div>
      </div>

      <div className="p-4 bg-muted/20">
        {CRITERIOS_EVALUACION_R2D2.map((criterio) => {
          const estado_criterio = evaluation[criterio.clave] || { check: false, score: 0, comment: "" };
          return (
            <div
              key={criterio.clave}
              className="flex flex-col md:flex-row items-stretch gap-2 mb-4 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0 flex items-center justify-center bg-blue-500 dark:bg-blue-600 text-white font-bold text-4xl w-16 h-full min-h-[100px] rounded-md shadow-sm">
                {criterio.letra}
              </div>
              <div className="w-48 bg-card rounded-md shadow-sm border border-border p-3">
                <p className="font-bold text-sm text-foreground">{criterio.titulo}</p>
                {criterio.subtitulo && (
                  <p className="text-xs text-muted-foreground">{criterio.subtitulo}</p>
                )}
              </div>
              <div className="flex-1 bg-cyan-700 text-white rounded-md shadow-sm p-3 text-xs leading-relaxed">
                <ul className="list-disc pl-4 space-y-1">
                  {criterio.puntos_guia.map((linea_guia) => (
                    <li key={linea_guia}>{linea_guia}</li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-64 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-semibold">¿CUMPLE?</Label>
                  <input
                    type="checkbox"
                    checked={estado_criterio.check}
                    disabled={Boolean(disabled)}
                    onChange={(evento) => actualizar_campo(criterio.clave, "check", evento.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                    ¿CÓMO LO ESTAMOS HACIENDO?
                  </Label>
                  <Textarea
                    disabled={Boolean(disabled)}
                    value={estado_criterio.comment}
                    onChange={(evento) => actualizar_campo(criterio.clave, "comment", evento.target.value)}
                    className="min-h-[60px] text-xs resize-y"
                    placeholder="Escribe comentarios aquí..."
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                    PUNTUACIÓN
                  </Label>
                  <Select
                    disabled={Boolean(disabled)}
                    value={estado_criterio.score.toString()}
                    onValueChange={(puntaje_str) =>
                      actualizar_campo(criterio.clave, "score", parseInt(puntaje_str, 10))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Evaluar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCIONES_CALIFICACION_R2D2.map((opcion) => (
                        <SelectItem key={opcion.value} value={opcion.value} className="text-xs">
                          {opcion.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-muted/50 border-t border-border p-3 text-xs text-muted-foreground flex items-center gap-2">
        <span className="font-semibold">Evaluado por:</span>
        <span className="italic flex flex-wrap gap-x-4 gap-y-1">
          {evaluation.evaluators && evaluation.evaluators.length > 0
            ? evaluation.evaluators.map((evaluador, indice_evaluador) => {
                const es_objeto = typeof evaluador === "object" && evaluador !== null;
                const nombre = es_objeto ? evaluador.name : String(evaluador);
                const fecha_formateada =
                  es_objeto && evaluador.timestamp
                    ? new Date(evaluador.timestamp).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                return (
                  <span key={`${nombre}-${indice_evaluador}`} className="inline-flex items-center gap-1">
                    {nombre}{" "}
                    {fecha_formateada && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        ({fecha_formateada})
                      </span>
                    )}
                  </span>
                );
              })
            : "Nadie ha evaluado aún"}
        </span>
      </div>
    </div>
  );
};
