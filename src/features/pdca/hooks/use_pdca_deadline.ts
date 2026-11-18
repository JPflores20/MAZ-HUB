/**
 * @fileoverview Hook para calcular si un proyecto PDCA está bloqueado por vencimiento de fecha límite.
 */
import { useMemo } from "react";
import { parse_date_string } from "../utils/date_helpers";

/**
 * Determina si un PDCA debe tratarse como solo lectura por haber expirado su fecha de cierre.
 * Los administradores nunca son bloqueados por fecha límite.
 * @param is_administrator - Bandera de privilegios de administrador.
 * @param deadline_date_string - Cadena con la fecha límite asignada al PDCA.
 */
export const use_pdca_deadline = (
  is_administrator: boolean,
  deadline_date_string?: string | null,
): boolean => {
  return useMemo(() => {
    if (is_administrator) {
      return false;
    }

    if (!deadline_date_string || typeof deadline_date_string !== "string") {
      return false;
    }

    const fecha_recortada = deadline_date_string.trim();
    if (fecha_recortada === "Sin límite" || fecha_recortada === "") {
      return false;
    }

    const fecha_limite = parse_date_string(fecha_recortada);
    if (!fecha_limite) {
      return false;
    }

    const dia_actual = new Date();
    dia_actual.setHours(0, 0, 0, 0);

    const dia_limite = new Date(fecha_limite.getTime());
    dia_limite.setHours(0, 0, 0, 0);

    return dia_limite < dia_actual;
  }, [is_administrator, deadline_date_string]);
};
