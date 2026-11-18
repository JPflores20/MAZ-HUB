/**
 * use_estadisticas_pre_incidentes.ts
 * Hook de cálculo analítico para el módulo "Precursores e Incidentes de Proceso"
 * (Matriz de Severidad de 7 criterios, Top Variables Afectadas y alertas QIR).
 */
import { useMemo } from "react";
import { CATALOGO_CRITERIOS_SEVERIDAD } from "@/domain/constants/usabilidad_catalogs";
import type {
  EstadisticasSeveridad,
  RegistroAnalisis5WRda,
} from "@/domain/models/usabilidad/usabilidad_types";

/**
 * Calcula las métricas de severidad, variables críticas e incidentes pendientes de QIR.
 *
 * @param registros_filtrados - Registros actualmente seleccionados tras los filtros del módulo.
 * @returns KPIs de severidad, top 12 variables afectadas y distribución de criterios activados.
 */
export function useEstadisticasPreIncidentes(registros_filtrados: RegistroAnalisis5WRda[]) {
  const estadisticas_severidad = useMemo<EstadisticasSeveridad>(() => {
    const total_eventos = registros_filtrados.length;
    const total_incidentes = registros_filtrados.filter(
      (registro_actual) => registro_actual.clasificacion_incidente === "Incidente",
    ).length;
    const total_precursores = total_eventos - total_incidentes;
    const precursores_alerta_50pts = registros_filtrados.filter(
      (registro_actual) =>
        registro_actual.clasificacion_incidente === "Precursor" &&
        registro_actual.porcentaje_severidad === 50,
    ).length;
    const pendientes_reporte_qir = registros_filtrados.filter(
      (registro_actual) =>
        registro_actual.clasificacion_incidente === "Incidente" &&
        registro_actual.estatus_reporte_incidente !== "ENVIADO",
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

    registros_filtrados.forEach((registro_actual) => {
      const nombre_variable = registro_actual.variable_afectada || "NA";
      if (nombre_variable === "NA") return;
      const acumulado_variable = mapa_variables.get(nombre_variable) || {
        nombre_variable,
        precursores: 0,
        incidentes: 0,
        total: 0,
      };
      acumulado_variable.total += 1;
      if (registro_actual.clasificacion_incidente === "Incidente") {
        acumulado_variable.incidentes += 1;
      } else {
        acumulado_variable.precursores += 1;
      }
      mapa_variables.set(nombre_variable, acumulado_variable);
    });

    return Array.from(mapa_variables.values())
      .sort((primera_var, segunda_var) => segunda_var.total - primera_var.total)
      .slice(0, 12);
  }, [registros_filtrados]);

  const datos_activacion_criterios = useMemo(() => {
    return CATALOGO_CRITERIOS_SEVERIDAD.map((criterio_severidad) => {
      const cantidad_activaciones = registros_filtrados.filter((registro_actual) =>
        Boolean(registro_actual.criterios_severidad[criterio_severidad.clave]),
      ).length;
      return {
        etiqueta_criterio: criterio_severidad.etiqueta,
        puntos_criterio: criterio_severidad.puntos,
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
