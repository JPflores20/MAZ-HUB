/**
 * @fileoverview Sub-hook de estado para resultados posteriores (CHECK): Gemba, series finales, Pareto y correlación.
 */
import { useState } from "react";
import {
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_TARGET_VS_ACTUAL,
  type NuevoPerformanceItem,
  type ParetoItem,
  type Pdca,
} from "@/domain/pdca";
import type { ElementoSerieTemporal } from "../plan/paso_7/time_series_table";
import type { DatosCorrelacionSabor } from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";

type RegistroCrudo = Record<string, unknown>;

/**
 * Gestiona métricas de verificación posterior (CHECK), línea base e imágenes de desempeño nuevo.
 */
export const use_estado_pdca_resultados_check = (pdca_inicial: Pdca) => {
  const extendido = pdca_inicial as unknown as RegistroCrudo;

  const [imagen_linea_base, set_imagen_linea_base] = useState<string | undefined>(
    pdca_inicial.baselineImage || pdca_inicial.baseline_image,
  );
  const [datos_resultado_final_kpi, set_datos_resultado_final_kpi] = useState<
    ElementoSerieTemporal[]
  >(
    pdca_inicial.kpiFinalResultData || pdca_inicial.kpi_final_result_data || DEFAULT_TARGET_VS_ACTUAL,
  );
  const [unidad_resultado_final_kpi, set_unidad_resultado_final_kpi] = useState<string>(
    pdca_inicial.kpiFinalResultUnit || pdca_inicial.kpi_final_result_unit || "",
  );
  const [imagen_final_gemba, set_imagen_final_gemba] = useState<string | null>(
    pdca_inicial.gembaFinalImage || pdca_inicial.gemba_final_image || null,
  );
  const [imagenes_finales_gemba, set_imagenes_finales_gemba] = useState<string[]>(
    pdca_inicial.gembaFinalImages ||
      pdca_inicial.gemba_final_images ||
      (pdca_inicial.gembaFinalImage ? [pdca_inicial.gembaFinalImage] : []),
  );
  const [archivos_evidencia, set_archivos_evidencia] = useState<string[]>(
    pdca_inicial.evidencias || [],
  );
  const [archivos_documentos_kpi, set_archivos_documentos_kpi] = useState<string[]>(
    pdca_inicial.kpiDocuments || pdca_inicial.kpi_documents || [],
  );
  const [titulo_series_tiempo_final, set_titulo_series_tiempo_final] = useState<string>(
    pdca_inicial.finalTimeSeriesTitle || pdca_inicial.final_time_series_title || "RESULTADO FINAL",
  );
  const [datos_series_tiempo_final, set_datos_series_tiempo_final] = useState<
    ElementoSerieTemporal[]
  >(
    pdca_inicial.finalTimeSeriesData ||
      pdca_inicial.final_time_series_data ||
      DEFAULT_TARGET_VS_ACTUAL,
  );
  const [unidad_series_tiempo_final, set_unidad_series_tiempo_final] = useState<string>(
    pdca_inicial.finalTimeSeriesUnit || pdca_inicial.final_time_series_unit || "",
  );
  const [eje_y_min_series_tiempo_final, set_eje_y_min_series_tiempo_final] = useState<number>(
    pdca_inicial.finalTimeSeriesYmin ?? pdca_inicial.final_time_series_ymin ?? 0,
  );
  const [eje_y_max_series_tiempo_final, set_eje_y_max_series_tiempo_final] = useState<string>(
    pdca_inicial.finalTimeSeriesYmax || pdca_inicial.final_time_series_ymax || "auto",
  );
  const [titulo_tiempos_actuales, set_titulo_tiempos_actuales] = useState<string>(
    pdca_inicial.currentTimesTitle || pdca_inicial.current_times_title || "SITUACIÓN ACTUAL",
  );

  const [datos_nuevo_rendimiento, set_datos_nuevo_rendimiento] = useState<NuevoPerformanceItem[]>(
    pdca_inicial.nuevoPerformance || pdca_inicial.nuevo_performance || [],
  );
  const [imagen_nuevo_rendimiento, set_imagen_nuevo_rendimiento] = useState<string | undefined>(
    (pdca_inicial.nuevo_performance_image || extendido["nuevoPerformanceImage"]) as string | undefined,
  );
  const [imagen_nuevo_pareto, set_imagen_nuevo_pareto] = useState<string | undefined>(
    (pdca_inicial.nuevo_pareto_image || extendido["nuevoParetoImage"]) as string | undefined,
  );
  const [desglose_nuevo_pareto, set_desglose_nuevo_pareto] = useState<string[]>(
    (pdca_inicial.nuevo_pareto_drill_downs || extendido["nuevoParetoDrillDowns"] || []) as string[],
  );
  const [mapa_datos_nuevo_pareto, set_mapa_datos_nuevo_pareto] = useState<
    Record<string, ParetoItem[]>
  >(
    (pdca_inicial.nuevo_pareto_data_map ||
      extendido["nuevoParetoDataMap"] ||
      DEFAULT_PARETO_DATA_MAP) as Record<string, ParetoItem[]>,
  );
  const [unidad_nuevo_pareto, set_unidad_nuevo_pareto] = useState<string>(
    (pdca_inicial.nuevo_pareto_unit || extendido["nuevoParetoUnit"] || "") as string,
  );
  const [titulos_nuevo_pareto, set_titulos_nuevo_pareto] = useState<Record<string, string>>(
    (pdca_inicial.nuevo_pareto_titles || extendido["nuevoParetoTitles"] || {}) as Record<string, string>,
  );

  const [imagen_nueva_correlacion, set_imagen_nueva_correlacion] = useState<string | undefined>(
    pdca_inicial.nueva_correlacion_image,
  );
  const [tiene_nueva_correlacion, set_tiene_nueva_correlacion] = useState<boolean>(
    pdca_inicial.has_nueva_correlacion || false,
  );
  const [datos_nueva_correlacion, set_datos_nueva_correlacion] =
    useState<DatosCorrelacionSabor | null>(() => {
      const crudo = pdca_inicial.nueva_correlacion_data ?? extendido["nuevaCorrelacionData"] ?? null;
      return Array.isArray(crudo) ? null : (crudo as DatosCorrelacionSabor | null);
    });

  return {
    imagen_linea_base,
    set_imagen_linea_base,
    datos_resultado_final_kpi,
    set_datos_resultado_final_kpi,
    unidad_resultado_final_kpi,
    set_unidad_resultado_final_kpi,
    imagen_final_gemba,
    set_imagen_final_gemba,
    imagenes_finales_gemba,
    set_imagenes_finales_gemba,
    archivos_evidencia,
    set_archivos_evidencia,
    archivos_documentos_kpi,
    set_archivos_documentos_kpi,
    titulo_series_tiempo_final,
    set_titulo_series_tiempo_final,
    datos_series_tiempo_final,
    set_datos_series_tiempo_final,
    unidad_series_tiempo_final,
    set_unidad_series_tiempo_final,
    eje_y_min_series_tiempo_final,
    set_eje_y_min_series_tiempo_final,
    eje_y_max_series_tiempo_final,
    set_eje_y_max_series_tiempo_final,
    titulo_tiempos_actuales,
    set_titulo_tiempos_actuales,
    datos_nuevo_rendimiento,
    set_datos_nuevo_rendimiento,
    imagen_nuevo_rendimiento,
    set_imagen_nuevo_rendimiento,
    imagen_nuevo_pareto,
    set_imagen_nuevo_pareto,
    desglose_nuevo_pareto,
    set_desglose_nuevo_pareto,
    mapa_datos_nuevo_pareto,
    set_mapa_datos_nuevo_pareto,
    unidad_nuevo_pareto,
    set_unidad_nuevo_pareto,
    titulos_nuevo_pareto,
    set_titulos_nuevo_pareto,
    imagen_nueva_correlacion,
    set_imagen_nueva_correlacion,
    tiene_nueva_correlacion,
    set_tiene_nueva_correlacion,
    datos_nueva_correlacion,
    set_datos_nueva_correlacion,
  };
};
