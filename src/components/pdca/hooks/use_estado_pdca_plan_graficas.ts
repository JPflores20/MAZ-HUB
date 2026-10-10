import { useState, useCallback } from "react";
import type { Pdca, VpoCheckpointItem, ParetoItem, DefinicionMeta } from "@/data/pdca";
import {
  DEFAULT_VPO_CHECKPOINTS,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
} from "@/data/pdca";
import { DEFAULT_DEFINICION_META } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";

export const use_estado_pdca_plan_graficas = (pdcaInicial: Pdca) => {
  const [puntosControlVpo, setPuntosControlVpo] = useState<VpoCheckpointItem[]>(
    pdcaInicial.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS,
  );

  const [desglosePareto, setDesglosePareto] = useState<string[]>(
    pdcaInicial.paretoDrillDowns || [],
  );
  const [mapaDatosPareto, setMapaDatosPareto] = useState<Record<string, ParetoItem[]>>(
    pdcaInicial.paretoDataMap || DEFAULT_PARETO_DATA_MAP,
  );
  const [unidadPareto, setUnidadPareto] = useState<string>(
    pdcaInicial.paretoUnit || pdcaInicial.pareto_unit || "",
  );
  const [titulosPareto, setTitulosPareto] = useState<Record<string, string>>(
    pdcaInicial.paretoTitles || pdcaInicial.pareto_titles || {},
  );

  const [metaContraReal, setMetaContraReal] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(pdcaInicial.targetVsActual || pdcaInicial.target_vs_actual || DEFAULT_TARGET_VS_ACTUAL);
  const [unidadMetaContraReal, setUnidadMetaContraReal] = useState<string>(
    pdcaInicial.targetVsActualUnit || pdcaInicial.target_vs_actual_unit || "",
  );
  const [tituloMetaContraReal, setTituloMetaContraReal] = useState<string>(
    pdcaInicial.targetVsActualTitle || pdcaInicial.target_vs_actual_title || "SITUACIÓN ACTUAL",
  );
  const [ejeYMinMetaContraReal, setEjeYMinMetaContraReal] = useState<number>(
    pdcaInicial.targetVsActualYmin ?? pdcaInicial.target_vs_actual_ymin ?? 0,
  );
  const [ejeYMaxMetaContraReal, setEjeYMaxMetaContraReal] = useState<string>(
    pdcaInicial.targetVsActualYmax || pdcaInicial.target_vs_actual_ymax || "auto",
  );

  const [nodosKpi, setNodosKpi] = useState<any[]>(pdcaInicial.kpiNodes || []);
  const [enlacesKpi, setEnlacesKpi] = useState<any[]>(pdcaInicial.kpiEdges || []);

  const alCambiarKpi = useCallback((nodos: any[], enlaces: any[]) => {
    setNodosKpi(nodos);
    setEnlacesKpi(enlaces);
  }, []);

  const [imagenFocoKpiTree, setImagenFocoKpiTree] = useState<string | undefined>(
    pdcaInicial.kpiTreeFocoImage || pdcaInicial.kpi_tree_foco_image,
  );

  const [opcionLineaTiempoProblema, setOpcionLineaTiempoProblema] = useState<"A" | "B">(
    pdcaInicial.problemTimelineOption || "A",
  );
  const [filtroLineaTiempoProblema, setFiltroLineaTiempoProblema] = useState<
    "day" | "week" | "month" | "3months"
  >(pdcaInicial.problemTimelineFilter || "day");
  const [eventosLineaTiempoProblema, setEventosLineaTiempoProblema] = useState<
    { id: string; time: string; description: string }[]
  >(pdcaInicial.problemTimelineEvents || []);

  const [definicionDeMeta, setDefinicionDeMeta] = useState<DefinicionMeta>(
    pdcaInicial.definicionMeta || DEFAULT_DEFINICION_META,
  );

  const [pisRendimientoActual, setPisRendimientoActual] = useState<any[]>(
    pdcaInicial.rendimientoActualPis || pdcaInicial.rendimiento_actual_pis || [],
  );
  const [imagenRendimientoActual, setImagenRendimientoActual] = useState<string | undefined>(
    pdcaInicial.rendimientoActualImage || pdcaInicial.rendimiento_actual_image,
  );

  return {
    puntosControlVpo,
    setPuntosControlVpo,
    desglosePareto,
    setDesglosePareto,
    mapaDatosPareto,
    setMapaDatosPareto,
    unidadPareto,
    setUnidadPareto,
    titulosPareto,
    setTitulosPareto,
    metaContraReal,
    setMetaContraReal,
    unidadMetaContraReal,
    setUnidadMetaContraReal,
    tituloMetaContraReal,
    setTituloMetaContraReal,
    ejeYMinMetaContraReal,
    setEjeYMinMetaContraReal,
    ejeYMaxMetaContraReal,
    setEjeYMaxMetaContraReal,
    nodosKpi,
    enlacesKpi,
    alCambiarKpi,
    imagenFocoKpiTree,
    setImagenFocoKpiTree,
    opcionLineaTiempoProblema,
    setOpcionLineaTiempoProblema,
    filtroLineaTiempoProblema,
    setFiltroLineaTiempoProblema,
    eventosLineaTiempoProblema,
    setEventosLineaTiempoProblema,
    definicionDeMeta,
    setDefinicionDeMeta,
    pisRendimientoActual,
    setPisRendimientoActual,
    imagenRendimientoActual,
    setImagenRendimientoActual,
  };
};
