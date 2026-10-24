/**
 * use_estadisticas_usabilidad.ts
 * Hook de cálculo analítico para el módulo "Usabilidad de Herramientas" (Gráficos Usab,
 * Deudores por Responsable, Ciclo SDCA y KPIs de cierre y calidad IAL).
 */
import { useMemo } from "react";
import {
  calcular_resumen_deudores,
  normalizar_calificacion_porcentaje,
} from "@/data/usabilidad/usabilidad_calculators";
import {
  CATALOGO_PILARES_SDCA,
  NOMBRES_MESES,
} from "@/data/usabilidad/usabilidad_catalogs";
import type {
  EstadisticasKpiUsabilidad,
  RegistroAnalisis5WRda,
  ResumenDeudorResponsable,
} from "@/data/usabilidad/usabilidad_types";

export function use_estadisticas_usabilidad(
  registros_filtrados: RegistroAnalisis5WRda[],
) {
  const estadisticas_kpi = useMemo<EstadisticasKpiUsabilidad>(() => {
    const total_registros = registros_filtrados.length;
    const conteo_5w = registros_filtrados.filter((r) => r.tipo_herramienta === "5W").length;
    const conteo_rda = registros_filtrados.filter((r) => r.tipo_herramienta === "RDA").length;
    const conteo_pdca = registros_filtrados.filter((r) => r.tipo_herramienta === "PDCA").length;
    const conteo_completos = registros_filtrados.filter(
      (r) => r.estatus_analisis === "Completo",
    ).length;
    const conteo_en_proceso = total_registros - conteo_completos;
    const porcentaje_cierre =
      total_registros > 0 ? Math.round((conteo_completos / total_registros) * 100) : 0;

    const calificaciones_validas = registros_filtrados
      .map((r) => normalizar_calificacion_porcentaje(r.calificacion_ial))
      .filter((valor): valor is number => valor !== null && valor > 0);

    const promedio_calidad_ial =
      calificaciones_validas.length > 0
        ? Math.round(
            (calificaciones_validas.reduce((a, b) => a + b, 0) /
              calificaciones_validas.length) *
              10,
          ) / 10
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

    registros_filtrados.forEach((registro) => {
      const fila_mes = mapa_meses.get(registro.mes_evento);
      if (!fila_mes) return;
      fila_mes.total += 1;
      if (registro.tipo_herramienta === "5W") fila_mes.conteo_5w += 1;
      else fila_mes.conteo_rda_pdca += 1;

      if (registro.estatus_analisis === "Completo") fila_mes.completos += 1;
      else fila_mes.en_proceso += 1;
    });

    return Array.from(mapa_meses.values()).filter((item) => item.total > 0);
  }, [registros_filtrados]);

  const datos_pilares_sdca = useMemo(() => {
    return CATALOGO_PILARES_SDCA.map((pilar) => {
      const cantidad_activaciones = registros_filtrados.filter((registro) =>
        Boolean(registro.pilares_sdca[pilar.clave]),
      ).length;
      return {
        clave: pilar.clave,
        nombre_corto: pilar.etiqueta_corta,
        nombre_completo: pilar.etiqueta_completa,
        cantidad: cantidad_activaciones,
      };
    }).sort((a, b) => b.cantidad - a.cantidad);
  }, [registros_filtrados]);

  const datos_top_procesos = useMemo(() => {
    const conteo_por_proceso = new Map<
      string,
      { nombre_proceso: string; conteo_5w: number; conteo_rda: number; total: number }
    >();
    registros_filtrados.forEach((registro) => {
      const clave_proceso = registro.proceso_cervecero || "General";
      const actual = conteo_por_proceso.get(clave_proceso) || {
        nombre_proceso: clave_proceso,
        conteo_5w: 0,
        conteo_rda: 0,
        total: 0,
      };
      actual.total += 1;
      if (registro.tipo_herramienta === "5W") actual.conteo_5w += 1;
      else actual.conteo_rda += 1;
      conteo_por_proceso.set(clave_proceso, actual);
    });
    return Array.from(conteo_por_proceso.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [registros_filtrados]);

  const datos_pastel_area = useMemo(() => {
    const conteo_por_area = new Map<string, number>();
    registros_filtrados.forEach((registro) => {
      conteo_por_area.set(
        registro.area_operativa,
        (conteo_por_area.get(registro.area_operativa) || 0) + 1,
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
