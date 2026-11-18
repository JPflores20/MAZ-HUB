/**
 * @fileoverview Hook de estado para gráficas YTD, Paretos, Checkpoints VPO, Metas y Rendimiento en PLAN.
 */
import { useCallback, useState } from "react";
import {
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_VPO_CHECKPOINTS,
  type DefinicionMeta,
  type ParetoItem,
  type Pdca,
  type RendimientoActualPiItem,
  type VpoCheckpointItem,
} from "@/domain/pdca";
import { DEFAULT_DEFINICION_META } from "../plan/paso_1/pdca_goal_constants";

/**
 * Administra series temporales, árbol KPI, línea de tiempo y configuración Pareto de la fase PLAN.
 */
export const use_estado_pdca_plan_graficas = (pdca_inicial: Pdca) => {
  const [puntos_control_vpo, set_puntos_control_vpo] = useState<VpoCheckpointItem[]>(
    pdca_inicial.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS,
  );
  const [desglose_pareto, set_desglose_pareto] = useState<string[]>(
    pdca_inicial.paretoDrillDowns || pdca_inicial.pareto_drill_downs || [],
  );
  const [mapa_datos_pareto, set_mapa_datos_pareto] = useState<Record<string, ParetoItem[]>>(
    pdca_inicial.paretoDataMap || pdca_inicial.pareto_data_map || DEFAULT_PARETO_DATA_MAP,
  );
  const [unidad_pareto, set_unidad_pareto] = useState<string>(
    pdca_inicial.paretoUnit || pdca_inicial.pareto_unit || "",
  );
  const [titulos_pareto, set_titulos_pareto] = useState<Record<string, string>>(
    pdca_inicial.paretoTitles || pdca_inicial.pareto_titles || {},
  );

  const [meta_contra_real, set_meta_contra_real] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(pdca_inicial.targetVsActual || pdca_inicial.target_vs_actual || DEFAULT_TARGET_VS_ACTUAL);
  const [unidad_meta_contra_real, set_unidad_meta_contra_real] = useState<string>(
    pdca_inicial.targetVsActualUnit || pdca_inicial.target_vs_actual_unit || "",
  );
  const [titulo_meta_contra_real, set_titulo_meta_contra_real] = useState<string>(
    pdca_inicial.targetVsActualTitle || pdca_inicial.target_vs_actual_title || "SITUACIÓN ACTUAL",
  );
  const [eje_y_min_meta_contra_real, set_eje_y_min_meta_contra_real] = useState<number>(
    pdca_inicial.targetVsActualYmin ?? pdca_inicial.target_vs_actual_ymin ?? 0,
  );
  const [eje_y_max_meta_contra_real, set_eje_y_max_meta_contra_real] = useState<string>(
    pdca_inicial.targetVsActualYmax || pdca_inicial.target_vs_actual_ymax || "auto",
  );

  const [nodos_kpi, set_nodos_kpi] = useState<unknown[]>(pdca_inicial.kpiNodes || []);
  const [enlaces_kpi, set_enlaces_kpi] = useState<unknown[]>(pdca_inicial.kpiEdges || []);

  const al_cambiar_kpi = useCallback((nuevos_nodos: unknown[], nuevos_enlaces: unknown[]) => {
    set_nodos_kpi(nuevos_nodos);
    set_enlaces_kpi(nuevos_enlaces);
  }, []);

  const [imagen_foco_kpi_tree, set_imagen_foco_kpi_tree] = useState<string | undefined>(
    pdca_inicial.kpiTreeFocoImage || pdca_inicial.kpi_tree_foco_image,
  );
  const [opcion_linea_tiempo_problema, set_opcion_linea_tiempo_problema] = useState<"A" | "B">(
    pdca_inicial.problemTimelineOption || "A",
  );
  const [filtro_linea_tiempo_problema, set_filtro_linea_tiempo_problema] = useState<
    "day" | "week" | "month" | "3months"
  >(pdca_inicial.problemTimelineFilter || "day");
  const [eventos_linea_tiempo_problema, set_eventos_linea_tiempo_problema] = useState<
    { id: string; time: string; description: string }[]
  >(pdca_inicial.problemTimelineEvents || []);

  const [definicion_de_meta, set_definicion_de_meta] = useState<DefinicionMeta>(
    pdca_inicial.definicionMeta || DEFAULT_DEFINICION_META,
  );
  const [pis_rendimiento_actual, set_pis_rendimiento_actual] = useState<RendimientoActualPiItem[]>(
    pdca_inicial.rendimientoActualPis || pdca_inicial.rendimiento_actual_pis || [],
  );
  const [imagen_rendimiento_actual, set_imagen_rendimiento_actual] = useState<string | undefined>(
    pdca_inicial.rendimientoActualImage || pdca_inicial.rendimiento_actual_image,
  );

  return {
    puntos_control_vpo,
    set_puntos_control_vpo,
    desglose_pareto,
    set_desglose_pareto,
    mapa_datos_pareto,
    set_mapa_datos_pareto,
    unidad_pareto,
    set_unidad_pareto,
    titulos_pareto,
    set_titulos_pareto,
    meta_contra_real,
    set_meta_contra_real,
    unidad_meta_contra_real,
    set_unidad_meta_contra_real,
    titulo_meta_contra_real,
    set_titulo_meta_contra_real,
    eje_y_min_meta_contra_real,
    set_eje_y_min_meta_contra_real,
    eje_y_max_meta_contra_real,
    set_eje_y_max_meta_contra_real,
    nodos_kpi,
    enlaces_kpi,
    al_cambiar_kpi,
    imagen_foco_kpi_tree,
    set_imagen_foco_kpi_tree,
    opcion_linea_tiempo_problema,
    set_opcion_linea_tiempo_problema,
    filtro_linea_tiempo_problema,
    set_filtro_linea_tiempo_problema,
    eventos_linea_tiempo_problema,
    set_eventos_linea_tiempo_problema,
    definicion_de_meta,
    set_definicion_de_meta,
    pis_rendimiento_actual,
    set_pis_rendimiento_actual,
    imagen_rendimiento_actual,
    set_imagen_rendimiento_actual,
  };
};
