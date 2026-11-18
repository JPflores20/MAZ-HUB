/**
 * @fileoverview Sub-hook de estado para estandarización (ACT), conclusiones ejecutivas y auditoría R2D2.
 */
import { useState } from "react";
import type {
  ConclusionesKpiData,
  ConclusionesPiItem,
  ItfR2d2Evaluation,
  Pdca,
  ResultadosFinalesData,
  TablaEstandarizacionItem,
  TablaEstandarizacionVpoItem,
} from "@/domain/pdca";

type RegistroCrudo = Record<string, unknown>;

const EVALUACION_R2D2_INICIAL: ItfR2d2Evaluation = {
  rightPeople: { check: false, score: 0, comment: "" },
  rightProblem: { check: false, score: 0, comment: "" },
  dataWillSetYouFree: { check: false, score: 0, comment: "" },
  dontReinventTheWheel: { check: false, score: 0, comment: "" },
  noHippos: { check: false, score: 0, comment: "" },
};

/**
 * Administra tablas de estandarización VPO, SOPs, lecciones aprendidas, storyboard y evaluación ITF R2D2.
 */
export const use_estado_pdca_resultados_act = (pdca_inicial: Pdca) => {
  const extendido = pdca_inicial as unknown as RegistroCrudo;

  const [datos_tabla_estandarizacion, set_datos_tabla_estandarizacion] = useState<
    TablaEstandarizacionItem[]
  >(pdca_inicial.tablaEstandarizacion || pdca_inicial.tabla_estandarizacion || []);
  const [datos_tabla_estandarizacion_vpo, set_datos_tabla_estandarizacion_vpo] = useState<
    TablaEstandarizacionVpoItem[]
  >(pdca_inicial.tablaEstandarizacionVpo || pdca_inicial.tabla_estandarizacion_vpo || []);
  const [datos_resultados_finales, set_datos_resultados_finales] =
    useState<ResultadosFinalesData>(
      pdca_inicial.resultadosFinales || pdca_inicial.resultados_finales || {},
    );
  const [texto_conclusiones_finales, set_texto_conclusiones_finales] = useState<string>(
    pdca_inicial.conclusionesFinales || pdca_inicial.conclusiones_finales || "",
  );
  const [imagen_conclusiones_storyboard, set_imagen_conclusiones_storyboard] = useState<
    string | undefined
  >(pdca_inicial.conclusionesStoryboardImage || pdca_inicial.conclusiones_storyboard_image);
  const [datos_conclusiones_kpi, set_datos_conclusiones_kpi] = useState<
    ConclusionesKpiData | undefined
  >(pdca_inicial.conclusionesKpiData || pdca_inicial.conclusiones_kpi_data);
  const [items_conclusiones_pi, set_items_conclusiones_pi] = useState<ConclusionesPiItem[]>(
    pdca_inicial.conclusionesPiItems || pdca_inicial.conclusiones_pi_items || [],
  );

  const [imagen_sops_documentos, set_imagen_sops_documentos] = useState<string | undefined>(
    (extendido["sopsDocumentosImage"] || extendido["sops_documentos_image"]) as string | undefined,
  );
  const [imagen_plan_entrenamiento, set_imagen_plan_entrenamiento] = useState<string | undefined>(
    (extendido["planEntrenamientoImage"] || extendido["plan_entrenamiento_image"]) as string | undefined,
  );
  const [imagen_plan_control, set_imagen_plan_control] = useState<string | undefined>(
    (extendido["planControlImage"] || extendido["plan_control_image"]) as string | undefined,
  );
  const [texto_lecciones_aprendidas, set_texto_lecciones_aprendidas] = useState<string>(
    (extendido["leccionesAprendidas"] || extendido["lecciones_aprendidas"] || "") as string,
  );
  const [imagen_benchmark, set_imagen_benchmark] = useState<string | undefined>(
    (extendido["benchmarkImage"] || extendido["benchmark_image"]) as string | undefined,
  );
  const [evaluacion_itf_r2d2, set_evaluacion_itf_r2d2] = useState<ItfR2d2Evaluation>(
    pdca_inicial.itfR2d2Evaluation || pdca_inicial.itf_r2d2_evaluation || EVALUACION_R2D2_INICIAL,
  );

  return {
    datos_tabla_estandarizacion,
    set_datos_tabla_estandarizacion,
    datos_tabla_estandarizacion_vpo,
    set_datos_tabla_estandarizacion_vpo,
    datos_resultados_finales,
    set_datos_resultados_finales,
    texto_conclusiones_finales,
    set_texto_conclusiones_finales,
    imagen_conclusiones_storyboard,
    set_imagen_conclusiones_storyboard,
    datos_conclusiones_kpi,
    set_datos_conclusiones_kpi,
    items_conclusiones_pi,
    set_items_conclusiones_pi,
    imagen_sops_documentos,
    set_imagen_sops_documentos,
    imagen_plan_entrenamiento,
    set_imagen_plan_entrenamiento,
    imagen_plan_control,
    set_imagen_plan_control,
    texto_lecciones_aprendidas,
    set_texto_lecciones_aprendidas,
    imagen_benchmark,
    set_imagen_benchmark,
    evaluacion_itf_r2d2,
    set_evaluacion_itf_r2d2,
  };
};
