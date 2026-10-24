/**
 * use_estadisticas_pre_incidentes.ts
 * Hook de cálculo analítico para el módulo "Precursores e Incidentes de Proceso"
 * (Matriz de Severidad de 7 criterios, Top Variables Afectadas y alertas QIR).
 */
import { useMemo } from "react";
import { CATALOGO_CRITERIOS_SEVERIDAD } from "@/data/usabilidad/usabilidad_catalogs";
import type {
  EstadisticasSeveridad,
  RegistroAnalisis5WRda,
} from "@/data/usabilidad/usabilidad_types";

export function use_estadisticas_pre_incidentes(
  registros_filtrados: RegistroAnalisis5WRda[],
) {
  const estadisticas_severidad = useMemo<EstadisticasSeveridad>(() => {
    const total_eventos = registros_filtrados.length;
    const total_incidentes = registros_filtrados.filter(
      (r) => r.clasificacion_incidente === "Incidente",
    ).length;
    const total_precursores = total_eventos - total_incidentes;
    const precursores_alerta_50pts = registros_filtrados.filter(
      (r) =>
        r.clasificacion_incidente === "Precursor" && r.porcentaje_severidad === 50,
    ).length;
    const pendientes_reporte_qir = registros_filtrados.filter(
      (r) =>
        r.clasificacion_incidente === "Incidente" &&
        r.estatus_reporte_incidente !== "ENVIADO",
    ).length;

    return {
      total_eventos,
      total_incidentes,
      total_precursores,
      precursores_alerta_50pts,
      pendientes_reporte_qir,
    };
  }, [registros_filtrados]);

  const datos_top_variables_afectadas = useMemo(() => {
    const mapa_variables = new Map<
      string,
      {
        nombre_variable: string;
        precursores: number;
        incidentes: number;
        total: number;
      }
    >();

    registros_filtrados.forEach((registro) => {
      const nombre_var = registro.variable_afectada || "NA";
      if (nombre_var === "NA") return;
      const acumulado = mapa_variables.get(nombre_var) || {
        nombre_variable: nombre_var,
        precursores: 0,
        incidentes: 0,
        total: 0,
      };
      acumulado.total += 1;
      if (registro.clasificacion_incidente === "Incidente") {
        acumulado.incidentes += 1;
      } else {
        acumulado.precursores += 1;
      }
      mapa_variables.set(nombre_var, acumulado);
    });

    return Array.from(mapa_variables.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [registros_filtrados]);

  const datos_activacion_criterios = useMemo(() => {
    return CATALOGO_CRITERIOS_SEVERIDAD.map((criterio) => {
      const cantidad_activaciones = registros_filtrados.filter((registro) =>
        Boolean(registro.criterios_severidad[criterio.clave]),
      ).length;
      return {
        etiqueta_criterio: criterio.etiqueta,
        puntos_criterio: criterio.puntos,
        cantidad_eventos: cantidad_activaciones,
      };
    });
  }, [registros_filtrados]);

  return {
    estadisticas_severidad,
    datos_top_variables_afectadas,
    datos_activacion_criterios,
  };
}
