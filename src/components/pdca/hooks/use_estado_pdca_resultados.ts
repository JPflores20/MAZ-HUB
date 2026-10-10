import { useState } from "react";
import type { Pdca, ConclusionesKpiData, ConclusionesPiItem } from "@/data/pdca";
import { DEFAULT_TARGET_VS_ACTUAL } from "@/data/pdca";

export const use_estado_pdca_resultados = (pdcaInicial: Pdca) => {
  const [imagenLineaBase, setImagenLineaBase] = useState<string | undefined>(
    pdcaInicial.baselineImage || pdcaInicial.baseline_image,
  );

  const [datosResultadoFinalKpi, setDatosResultadoFinalKpi] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(
    pdcaInicial.kpiFinalResultData || pdcaInicial.kpi_final_result_data || DEFAULT_TARGET_VS_ACTUAL,
  );
  const [unidadResultadoFinalKpi, setUnidadResultadoFinalKpi] = useState<string>(
    pdcaInicial.kpiFinalResultUnit || pdcaInicial.kpi_final_result_unit || "",
  );

  const [imagenFinalGemba, setImagenFinalGemba] = useState<string | null>(
    pdcaInicial.gembaFinalImage || pdcaInicial.gemba_final_image || null,
  );
  const [imagenesFinalesGemba, setImagenesFinalesGemba] = useState<string[]>(
    pdcaInicial.gembaFinalImages ||
      pdcaInicial.gemba_final_images ||
      (pdcaInicial.gembaFinalImage ? [pdcaInicial.gembaFinalImage] : []),
  );

  const [archivosEvidencia, setArchivosEvidencia] = useState<string[]>(
    pdcaInicial.evidencias || [],
  );
  const [archivosDocumentosKpi, setArchivosDocumentosKpi] = useState<string[]>(
    pdcaInicial.kpiDocuments || pdcaInicial.kpi_documents || [],
  );

  const [tituloSeriesTiempoFinal, setTituloSeriesTiempoFinal] = useState<string>(
    pdcaInicial.finalTimeSeriesTitle || pdcaInicial.final_time_series_title || "RESULTADO FINAL",
  );
  const [datosSeriesTiempoFinal, setDatosSeriesTiempoFinal] = useState<any[]>(
    pdcaInicial.finalTimeSeriesData ||
      pdcaInicial.final_time_series_data ||
      DEFAULT_TARGET_VS_ACTUAL,
  );
  const [unidadSeriesTiempoFinal, setUnidadSeriesTiempoFinal] = useState<string>(
    pdcaInicial.finalTimeSeriesUnit || pdcaInicial.final_time_series_unit || "",
  );
  const [ejeYMinSeriesTiempoFinal, setEjeYMinSeriesTiempoFinal] = useState<number>(
    pdcaInicial.finalTimeSeriesYmin ?? pdcaInicial.final_time_series_ymin ?? 0,
  );
  const [ejeYMaxSeriesTiempoFinal, setEjeYMaxSeriesTiempoFinal] = useState<string>(
    pdcaInicial.finalTimeSeriesYmax || pdcaInicial.final_time_series_ymax || "auto",
  );
  const [tituloTiemposActuales, setTituloTiemposActuales] = useState<string>(
    pdcaInicial.currentTimesTitle || pdcaInicial.current_times_title || "SITUACIÓN ACTUAL",
  );

  const [datosNuevoRendimiento, setDatosNuevoRendimiento] = useState<any[]>(
    pdcaInicial.nuevoPerformance || pdcaInicial.nuevo_performance || [],
  );
  const [imagenNuevoRendimiento, setImagenNuevoRendimiento] = useState<string | undefined>(
    pdcaInicial.nuevo_performance_image,
  );

  const [imagenNuevoPareto, setImagenNuevoPareto] = useState<string | undefined>(
    pdcaInicial.nuevo_pareto_image,
  );
  const [desgloseNuevoPareto, setDesgloseNuevoPareto] = useState<string[]>(
    pdcaInicial.nuevo_pareto_drill_downs || [],
  );
  const [mapaDatosNuevoPareto, setMapaDatosNuevoPareto] = useState<Record<string, any[]>>(
    pdcaInicial.nuevo_pareto_data_map || {},
  );
  const [unidadNuevoPareto, setUnidadNuevoPareto] = useState<string>(
    pdcaInicial.nuevo_pareto_unit || "",
  );
  const [titulosNuevoPareto, setTitulosNuevoPareto] = useState<Record<string, string>>(
    pdcaInicial.nuevo_pareto_titles || {},
  );

  const [imagenNuevaCorrelacion, setImagenNuevaCorrelacion] = useState<string | undefined>(
    pdcaInicial.nueva_correlacion_image,
  );
  const [tieneNuevaCorrelacion, setTieneNuevaCorrelacion] = useState<boolean>(
    pdcaInicial.has_nueva_correlacion || false,
  );
  const [datosNuevaCorrelacion, setDatosNuevaCorrelacion] = useState<any[]>(
    pdcaInicial.nueva_correlacion_data || [],
  );

  const [datosTablaEstandarizacion, setDatosTablaEstandarizacion] = useState<any[]>(
    pdcaInicial.tablaEstandarizacion || pdcaInicial.tabla_estandarizacion || [],
  );
  const [datosTablaEstandarizacionVpo, setDatosTablaEstandarizacionVpo] = useState<any[]>(
    pdcaInicial.tablaEstandarizacionVpo || pdcaInicial.tabla_estandarizacion_vpo || [],
  );

  const [datosResultadosFinales, setDatosResultadosFinales] = useState<any>(
    pdcaInicial.resultadosFinales || pdcaInicial.resultados_finales || {},
  );

  const [textoConclusionesFinales, setTextoConclusionesFinales] = useState<string>(
    pdcaInicial.conclusionesFinales || pdcaInicial.conclusiones_finales || "",
  );
  const [imagenConclusionesStoryboard, setImagenConclusionesStoryboard] = useState<
    string | undefined
  >(pdcaInicial.conclusionesStoryboardImage || pdcaInicial.conclusiones_storyboard_image);
  const [datosConclusionesKpi, setDatosConclusionesKpi] = useState<ConclusionesKpiData | undefined>(
    pdcaInicial.conclusionesKpiData || pdcaInicial.conclusiones_kpi_data,
  );
  const [itemsConclusionesPi, setItemsConclusionesPi] = useState<ConclusionesPiItem[]>(
    pdcaInicial.conclusionesPiItems || pdcaInicial.conclusiones_pi_items || [],
  );

  const [imagenSopsDocumentos, setImagenSopsDocumentos] = useState<string | undefined>(
    (pdcaInicial as any).sopsDocumentosImage || (pdcaInicial as any).sops_documentos_image,
  );
  const [imagenPlanEntrenamiento, setImagenPlanEntrenamiento] = useState<string | undefined>(
    (pdcaInicial as any).planEntrenamientoImage || (pdcaInicial as any).plan_entrenamiento_image,
  );
  const [imagenPlanControl, setImagenPlanControl] = useState<string | undefined>(
    (pdcaInicial as any).planControlImage || (pdcaInicial as any).plan_control_image,
  );
  const [textoLeccionesAprendidas, setTextoLeccionesAprendidas] = useState<string>(
    (pdcaInicial as any).leccionesAprendidas || (pdcaInicial as any).lecciones_aprendidas || "",
  );
  const [imagenBenchmark, setImagenBenchmark] = useState<string | undefined>(
    (pdcaInicial as any).benchmarkImage || (pdcaInicial as any).benchmark_image,
  );

  const [evaluacionItfR2d2, setEvaluacionItfR2d2] = useState<any>(
    pdcaInicial.itfR2d2Evaluation ||
      pdcaInicial.itf_r2d2_evaluation || {
        rightPeople: { check: false, score: 0, comment: "" },
        rightProblem: { check: false, score: 0, comment: "" },
        dataWillSetYouFree: { check: false, score: 0, comment: "" },
        dontReinventTheWheel: { check: false, score: 0, comment: "" },
        noHippos: { check: false, score: 0, comment: "" },
      },
  );

  return {
    imagenLineaBase,
    setImagenLineaBase,
    datosResultadoFinalKpi,
    setDatosResultadoFinalKpi,
    unidadResultadoFinalKpi,
    setUnidadResultadoFinalKpi,
    imagenFinalGemba,
    setImagenFinalGemba,
    imagenesFinalesGemba,
    setImagenesFinalesGemba,
    archivosEvidencia,
    setArchivosEvidencia,
    archivosDocumentosKpi,
    setArchivosDocumentosKpi,
    tituloSeriesTiempoFinal,
    setTituloSeriesTiempoFinal,
    datosSeriesTiempoFinal,
    setDatosSeriesTiempoFinal,
    unidadSeriesTiempoFinal,
    setUnidadSeriesTiempoFinal,
    ejeYMinSeriesTiempoFinal,
    setEjeYMinSeriesTiempoFinal,
    ejeYMaxSeriesTiempoFinal,
    setEjeYMaxSeriesTiempoFinal,
    tituloTiemposActuales,
    setTituloTiemposActuales,
    datosNuevoRendimiento,
    setDatosNuevoRendimiento,
    imagenNuevoRendimiento,
    setImagenNuevoRendimiento,
    imagenNuevoPareto,
    setImagenNuevoPareto,
    desgloseNuevoPareto,
    setDesgloseNuevoPareto,
    mapaDatosNuevoPareto,
    setMapaDatosNuevoPareto,
    unidadNuevoPareto,
    setUnidadNuevoPareto,
    titulosNuevoPareto,
    setTitulosNuevoPareto,
    imagenNuevaCorrelacion,
    setImagenNuevaCorrelacion,
    tieneNuevaCorrelacion,
    setTieneNuevaCorrelacion,
    datosNuevaCorrelacion,
    setDatosNuevaCorrelacion,
    datosTablaEstandarizacion,
    setDatosTablaEstandarizacion,
    datosTablaEstandarizacionVpo,
    setDatosTablaEstandarizacionVpo,
    datosResultadosFinales,
    setDatosResultadosFinales,
    textoConclusionesFinales,
    setTextoConclusionesFinales,
    imagenConclusionesStoryboard,
    setImagenConclusionesStoryboard,
    datosConclusionesKpi,
    setDatosConclusionesKpi,
    itemsConclusionesPi,
    setItemsConclusionesPi,
    imagenSopsDocumentos,
    setImagenSopsDocumentos,
    imagenPlanEntrenamiento,
    setImagenPlanEntrenamiento,
    imagenPlanControl,
    setImagenPlanControl,
    textoLeccionesAprendidas,
    setTextoLeccionesAprendidas,
    imagenBenchmark,
    setImagenBenchmark,
    evaluacionItfR2d2,
    setEvaluacionItfR2d2,
  };
};
