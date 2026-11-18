/**
 * use_pdca_metrics.ts
 * Hook de cálculo memorizado para obtener contadores ejecutivos (activos, cerrados,
 * vencidos y por macro-área) a partir de una lista de PDCAs.
 */
import { useMemo } from "react";
import { isBefore, isValid, parseISO, startOfDay } from "date-fns";
import type { Pdca } from "@/domain/models/pdca";
import { is_bloque_frio_area } from "@/domain/pdca";

export interface PdcaMetrics {
  activos: number;
  cerrados: number;
  bloque_frio: number;
  cocimientos: number;
  vencidos: number;
  a_tiempo: number;
}

/**
 * Evalúa si la fecha límite de un PDCA activo está vencida respecto al inicio del día actual.
 *
 * @param raw_deadline - Cadena de fecha límite en formato `yyyy-MM-dd` o ISO.
 * @param today_start - Fecha base normalizada al inicio del día actual.
 * @returns `"vencido"` | `"a_tiempo"` | `null` cuando la fecha no existe o es inválida.
 */
function classify_deadline_status(
  raw_deadline: string | undefined,
  today_start: Date,
): "vencido" | "a_tiempo" | null {
  if (!raw_deadline) return null;

  try {
    const date_segments = raw_deadline.split("-");
    const parsed_deadline =
      date_segments.length === 3
        ? new Date(
            parseInt(date_segments[0] || "0"),
            parseInt(date_segments[1] || "0") - 1,
            parseInt(date_segments[2] || "0"),
          )
        : parseISO(raw_deadline);

    if (!isValid(parsed_deadline)) return null;
    return isBefore(parsed_deadline, today_start) ? "vencido" : "a_tiempo";
  } catch {
    return null;
  }
}

/**
 * Calcula las métricas agregadas de seguimiento para la vista principal y tarjetas KPI.
 *
 * @param pdca_items - Lista de documentos PDCA filtrados o completos.
 * @returns Objeto `PdcaMetrics` con los conteos calculados.
 */
export function usePdcaMetrics(pdca_items: Pdca[]): PdcaMetrics {
  return useMemo(() => {
    let activos = 0;
    let cerrados = 0;
    let bloque_frio = 0;
    let cocimientos = 0;
    let vencidos = 0;
    let a_tiempo = 0;

    const today_start = startOfDay(new Date());

    for (const pdca_item of pdca_items) {
      const is_closed = pdca_item.fase === "Act" && pdca_item.progreso === 100;

      if (is_closed) {
        cerrados++;
      } else {
        activos++;
        const deadline_status = classify_deadline_status(pdca_item.fecha_finalizacion, today_start);
        if (deadline_status === "vencido") vencidos++;
        else if (deadline_status === "a_tiempo") a_tiempo++;
      }

      const area_lower = (pdca_item.area || "").toLowerCase();
      if (is_bloque_frio_area(pdca_item.area)) {
        bloque_frio++;
      } else if (area_lower.includes("cocimiento")) {
        cocimientos++;
      }
    }

    return {
      activos,
      cerrados,
      bloque_frio,
      cocimientos,
      vencidos,
      a_tiempo,
    };
  }, [pdca_items]);
}
