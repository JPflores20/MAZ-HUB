/**
 * @fileoverview Hook que serializa el estado completo de edición del PDCA en un payload compatible con Firestore.
 */
import { useCallback } from "react";
import type { Pdca } from "@/domain/pdca";
import { format_date_to_string, parse_date_string } from "../utils/date_helpers";
import type { EstadoDialogoPdca } from "./use_pdca_dialog_state";

/**
 * Construye una función memoizada que genera el objeto `Pdca` listo para persistirse en base de datos.
 */
export function use_construir_payload_pdca(
  pdca_actual: Pdca,
  estado_pdca: EstadoDialogoPdca,
  progreso_calculado: number,
) {
  return useCallback((): Pdca => {
    const fecha_finalizacion = estado_pdca.deadline_date
      ? format_date_to_string(estado_pdca.deadline_date)
      : pdca_actual.fechaFinalizacion === "Sin límite" ||
          pdca_actual.fechaFinalizacion === "Sin lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­mite"
        ? "Sin límite"
        : pdca_actual.fechaFinalizacion && !parse_date_string(pdca_actual.fechaFinalizacion)
          ? pdca_actual.fechaFinalizacion
          : "";

    const correos_asignados = Array.from(
      new Set(
        (estado_pdca.assigned_users || [])
          .map((usuario) => (usuario?.email || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    return {
      ...pdca_actual,
      titulo: estado_pdca.title_value,
      planta: estado_pdca.planta_value,
      departamento: estado_pdca.departamento_value,
      area: estado_pdca.area_value,
      etapa: estado_pdca.etapa_value,
      fase: estado_pdca.active_tab,
      problema: estado_pdca.problem_value,
      causaRaiz: estado_pdca.root_cause_value,
      acciones: estado_pdca.action_items,
      targetVsActual: estado_pdca.target_vs_actual,
      targetVsActualUnit: estado_pdca.target_vs_actual_unit,
      targetVsActualTitle: estado_pdca.target_vs_actual_title,
      targetVsActualYmin: estado_pdca.target_vs_actual_ymin,
      targetVsActualYmax: estado_pdca.target_vs_actual_ymax,
      kpiFinalResultData: estado_pdca.kpi_final_result_data,
      kpiFinalResultUnit: estado_pdca.kpi_final_result_unit,
      gembaFinalImage: estado_pdca.gemba_final_image,
      gembaFinalImages: estado_pdca.gemba_final_images,
      evidencias: estado_pdca.evidence_files,
      kpiDocuments: estado_pdca.kpi_document_files,
      paretoDataMap: estado_pdca.pareto_data_map,
      pareto_data_map: estado_pdca.pareto_data_map,
      paretoDrillDowns: estado_pdca.pareto_drill_downs,
      pareto_drill_downs: estado_pdca.pareto_drill_downs,
      paretoUnit: estado_pdca.pareto_unit,
      pareto_unit: estado_pdca.pareto_unit,
      paretoTitles: estado_pdca.pareto_titles,
      pareto_titles: estado_pdca.pareto_titles,
      vpoCheckpoints: estado_pdca.vpo_checkpoints,
      definicionMeta: estado_pdca.definition_goal,
      participantes: estado_pdca.participants_data,
      equipo: estado_pdca.team_members,
      ishikawas: estado_pdca.ishikawas,
      fiveWhysTables: estado_pdca.five_whys_tables,
      impactMatrix: estado_pdca.impact_matrix,
      hasFlavorCorrelation: estado_pdca.has_flavor_correlation,
      flavorCorrelationData: estado_pdca.flavor_correlation_data,
      statisticalAnalysisFiles: estado_pdca.statistical_analysis_files,
      hasGopThemes: estado_pdca.has_gop_themes,
      has_gop_themes: estado_pdca.has_gop_themes,
      gopThemesData: estado_pdca.gop_themes_data,
      gop_themes_data: estado_pdca.gop_themes_data,
      processMappingImage: estado_pdca.process_mapping_files?.[0] || null,
      processMappingFiles: estado_pdca.process_mapping_files,
      sipocMapFiles: estado_pdca.sipoc_map_files,
      problemTimelineOption: estado_pdca.problem_timeline_option,
      problemTimelineFilter: estado_pdca.problem_timeline_filter,
      problemTimelineEvents: estado_pdca.problem_timeline_events,
      itfR2d2Evaluation: estado_pdca.itf_r2d2_evaluation,
      baselineImage: estado_pdca.baseline_image,
      tablaEstandarizacion: estado_pdca.tabla_estandarizacion,
      tablaEstandarizacionVpo: estado_pdca.tabla_estandarizacion_vpo,
      resultadosFinales: estado_pdca.resultados_finales,
      kpiTreeFocoImage: estado_pdca.kpi_tree_foco_image,
      evidenciasSolucion: estado_pdca.evidencias_solucion,
      hasMapeoProceso: estado_pdca.has_mapeo_proceso,
      mapeoProcesoImage: estado_pdca.mapeo_proceso_image,
      mapeoProcesoDesc: estado_pdca.mapeo_proceso_desc || undefined,
      rendimiento_actual_pis: estado_pdca.rendimiento_actual_pis,
      rendimiento_actual_image: estado_pdca.rendimiento_actual_image,
      coleccionDatos: estado_pdca.coleccion_datos,
      especificacionProcesosText: estado_pdca.especificacion_procesos_text ?? undefined,
      especificacionProcesosImage: estado_pdca.especificacion_procesos_image,
      finalTimeSeriesTitle: estado_pdca.final_time_series_title,
      finalTimeSeriesData: estado_pdca.final_time_series_data,
      finalTimeSeriesUnit: estado_pdca.final_time_series_unit,
      finalTimeSeriesYmin: estado_pdca.final_time_series_ymin,
      finalTimeSeriesYmax: estado_pdca.final_time_series_ymax,
      currentTimesTitle: estado_pdca.current_times_title,
      ishikawaConceptos: estado_pdca.ishikawa_conceptos,
      informacionAdicionalFiles: estado_pdca.informacion_adicional_files,
      vozConsumidor: estado_pdca.voz_consumidor,
      analisisRiesgosProyecto: estado_pdca.analisis_riesgos_proyecto,
      conclusionesCausaRaiz: estado_pdca.conclusiones_causa_raiz,
      pruebasEjecutadas: estado_pdca.pruebas_ejecutadas,
      nuevoPerformance: estado_pdca.nuevo_performance,
      nuevo_performance_image: estado_pdca.nuevo_performance_image,
      nuevo_pareto_image: estado_pdca.nuevo_pareto_image,
      nuevo_pareto_drill_downs: estado_pdca.nuevo_pareto_drill_downs,
      nuevoParetoDrillDowns: estado_pdca.nuevo_pareto_drill_downs,
      nuevo_pareto_data_map: estado_pdca.nuevo_pareto_data_map,
      nuevoParetoDataMap: estado_pdca.nuevo_pareto_data_map,
      nuevo_pareto_unit: estado_pdca.nuevo_pareto_unit,
      nuevoParetoUnit: estado_pdca.nuevo_pareto_unit,
      nuevo_pareto_titles: estado_pdca.nuevo_pareto_titles,
      nuevoParetoTitles: estado_pdca.nuevo_pareto_titles,
      nueva_correlacion_image: estado_pdca.nueva_correlacion_image,
      has_nueva_correlacion: estado_pdca.has_nueva_correlacion,
      nueva_correlacion_data: estado_pdca.nueva_correlacion_data,
      analisisRiesgosEstandarizacion: estado_pdca.analisis_riesgos_estandarizacion,
      conclusionesFinales: estado_pdca.conclusiones_finales,
      conclusionesStoryboardImage: estado_pdca.conclusiones_storyboard_image,
      conclusionesKpiData: estado_pdca.conclusiones_kpi_data ?? undefined,
      conclusionesPiItems: estado_pdca.conclusiones_pi_items ?? undefined,
      sops_documentos_image: estado_pdca.sops_documentos_image,
      plan_entrenamiento_image: estado_pdca.plan_entrenamiento_image,
      plan_control_image: estado_pdca.plan_control_image,
      lecciones_aprendidas: estado_pdca.lecciones_aprendidas,
      benchmarkImage: estado_pdca.benchmark_image,
      comentarios: estado_pdca.comments_list,
      historial: estado_pdca.history_events,
      completedSteps: Array.from(estado_pdca.completed_steps),
      naSteps: Array.from(estado_pdca.na_steps),
      completedPhases: Array.from(estado_pdca.completed_phases),
      progreso: progreso_calculado,
      fechaFinalizacion: fecha_finalizacion,
      autor: estado_pdca.author_name,
      autorEmail: (estado_pdca.author_email || "").trim().toLowerCase(),
      asignados: estado_pdca.assigned_users,
      assignedEmails: correos_asignados,
      actualizado: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    } as unknown as Pdca;
  }, [pdca_actual, estado_pdca, progreso_calculado]);
}
