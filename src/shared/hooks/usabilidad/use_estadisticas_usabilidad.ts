/**
 * use_estadisticas_usabilidad.ts
 * Hook de cálculo analítico para el módulo "Usabilidad de Herramientas" (Gráficos Usab,
 * Deudores por Responsable, Ciclo SDCA y KPIs de cierre y calidad IAL).
 */
import { useMemo } from "react";
import {
  calcular_resumen_deudores,
  normalizar_calificacion_porcentaje,
} from "@/domain/calculators/usabilidad_calculators";
import {
  CATALOGO_PILARES_SDCA,
  NOMBRES_MESES,
} from "@/domain/constants/usabilidad_catalogs";
import type {
  EstadisticasKpiUsabilidad,
  RegistroAnalisis5WRda,
  ResumenDeudorResponsable,
} from "@/domain/models/usabilidad/usabilidad_types";

/**
 * Calcula los agregados estadísticos y series para las gráficas del tablero de Usabilidad.
 *
 * @param registros_filtrados - Subconjunto de registros actualmente visibles tras aplicar filtros.
 * @returns KPIs globales, serie mensual, frecuencia de pilares SDCA, top procesos/áreas y deudores.
 */
export function useEstadisticasUsabilidad(registros_filtrados: RegistroAnalisis5WRda[]) {
  const estadisticas_kpi = useMemo<EstadisticasKpiUsabilidad>(() => {
    const total_registros = registros_filtrados.length;
    const conteo_5w = registros_filtrados.filter(
      (registro_actual) => registro_actual.tipo_herramienta === "5W",
    ).length;
    const conteo_rda = registros_filtrados.filter(
      (registro_actual) => registro_actual.tipo_herramienta === "RDA",
    ).length;
    const conteo_pdca = registros_filtrados.filter(
      (registro_actual) => registro_actual.tipo_herramienta === "PDCA",
    ).length;
    const conteo_completos = registros_filtrados.filter(
      (registro_actual) => registro_actual.estatus_analisis === "Completo",
    ).length;
    const conteo_en_proceso = total_registros - conteo_completos;
    const porcentaje_cierre =
      total_registros > 0 ? Math.round((conteo_completos / total_registros) * 100) : 0;

    const calificaciones_validas = registros_filtrados
      .map((registro_actual) => normalizar_calificacion_porcentaje(registro_actual.calificacion_ial))
      .filter((valor_porcentaje): valor_porcentaje is number => valor_porcentaje !== null && valor_porcentaje > 0);

    const suma_calificaciones = calificaciones_validas.reduce(
      (acumulado_calificaciones, calificacion_actual) =>
        acumulado_calificaciones + calificacion_actual,
      0,
    );
    const promedio_calidad_ial =
      calificaciones_validas.length > 0
        ? Math.round((suma_calificaciones / calificaciones_validas.length) * 10) / 10
        : 0;

    return {
      total_registros,
      conteo_5w,
      conteo_rda,
      conteo_pdca,
      conteo_completos,
      conteo_en_proceso,
      porcentaje_cierre,
      promedio_calidad_ial,
      conteo_auditados: calificaciones_validas.length,
    };
  }, [registros_filtrados]);

  const datos_serie_mensual = useMemo(() => {
    const mapa_meses = new Map<
      number,
      {
        mes_numero: number;
        etiqueta_mes: string;
        conteo_5w: number;
        conteo_rda_pdca: number;
        completos: number;
        en_proceso: number;
        total: number;
      }
    >();

    for (let numero_mes = 1; numero_mes <= 12; numero_mes++) {
      mapa_meses.set(numero_mes, {
        mes_numero: numero_mes,
        etiqueta_mes: NOMBRES_MESES[numero_mes] || `M${numero_mes}`,
        conteo_5w: 0,
        conteo_rda_pdca: 0,
        completos: 0,
        en_proceso: 0,
        total: 0,
      });
    }

    registros_filtrados.forEach((registro_actual) => {
      const fila_mes = mapa_meses.get(registro_actual.mes_evento);
      if (!fila_mes) return;
      fila_mes.total += 1;
      if (registro_actual.tipo_herramienta === "5W") fila_mes.conteo_5w += 1;
      else fila_mes.conteo_rda_pdca += 1;

      if (registro_actual.estatus_analisis === "Completo") fila_mes.completos += 1;
      else fila_mes.en_proceso += 1;
    });

    return Array.from(mapa_meses.values()).filter((fila_mes) => fila_mes.total > 0);
  }, [registros_filtrados]);

  const datos_pilares_sdca = useMemo(() => {
    return CATALOGO_PILARES_SDCA.map((pilar_sdca) => {
      const cantidad_activaciones = registros_filtrados.filter((registro_actual) =>
        Boolean(registro_actual.pilares_sdca[pilar_sdca.clave]),
      ).length;
      return {
        clave: pilar_sdca.clave,
        nombre_corto: pilar_sdca.etiqueta_corta,
        nombre_completo: pilar_sdca.etiqueta_completa,
        cantidad: cantidad_activaciones,
      };
    }).sort((primer_pilar, segundo_pilar) => segundo_pilar.cantidad - primer_pilar.cantidad);
  }, [registros_filtrados]);

  const datos_top_procesos = useMemo(() => {
    const conteo_por_proceso = new Map<
      string,
      { nombre_proceso: string; conteo_5w: number; conteo_rda: number; total: number }
    >();
    registros_filtrados.forEach((registro_actual) => {
      const clave_proceso = registro_actual.proceso_cervecero || "General";
      const acumulado_proceso = conteo_por_proceso.get(clave_proceso) || {
        nombre_proceso: clave_proceso,
        conteo_5w: 0,
        conteo_rda: 0,
        total: 0,
      };
      acumulado_proceso.total += 1;
      if (registro_actual.tipo_herramienta === "5W") acumulado_proceso.conteo_5w += 1;
      else acumulado_proceso.conteo_rda += 1;
      conteo_por_proceso.set(clave_proceso, acumulado_proceso);
    });
    return Array.from(conteo_por_proceso.values())
      .sort((primer_proceso, segundo_proceso) => segundo_proceso.total - primer_proceso.total)
      .slice(0, 10);
  }, [registros_filtrados]);

  const datos_pastel_area = useMemo(() => {
    const conteo_por_area = new Map<string, number>();
    registros_filtrados.forEach((registro_actual) => {
      conteo_por_area.set(
        registro_actual.area_operativa,
        (conteo_por_area.get(registro_actual.area_operativa) || 0) + 1,
      );
    });
    return Array.from(conteo_por_area.entries()).map(([nombre_area, cantidad]) => ({
      name: nombre_area,
      value: cantidad,
    }));
  }, [registros_filtrados]);

  const lista_deudores = useMemo<ResumenDeudorResponsable[]>(
    () => calcular_resumen_deudores(registros_filtrados),
    [registros_filtrados],
  );

  return {
    estadisticas_kpi,
    datos_serie_mensual,
    datos_pilares_sdca,
    datos_top_procesos,
    datos_pastel_area,
    lista_deudores,
  };
}
