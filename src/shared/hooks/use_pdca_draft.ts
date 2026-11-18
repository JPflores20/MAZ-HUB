/**
 * use_pdca_draft.ts
 * Factory de borradores vacíos y hook de estado local para edición de proyectos PDCA.
 */
import { useEffect, useState } from "react";
import type { Pdca } from "@/domain/models/pdca";
import {
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_VPO_CHECKPOINTS,
} from "@/domain/pdca";

/**
 * Genera un objeto PDCA vacío (borrador) con valores iniciales por defecto.
 *
 * @param current_user - Datos opcionales del autor autenticado.
 * @returns Objeto `Pdca` inicializado en fase `Plan`.
 */
export function get_empty_draft(current_user?: { name?: string; email?: string }): Pdca {
  const random_suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return {
    id: `PDCA-${new Date().getFullYear()}-${random_suffix}`,
    titulo: "",
    area: "",
    fase: "Plan",
    actualizado: "Recién creado",
    progreso: 0,
    problema: "",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "", antes: 0, despues: 0, unidad: "" },
    serie: [],
    fecha_finalizacion: "",
    kpi_nodes: [],
    kpi_edges: [],
    completed_phases: [],
    completed_steps: [],
    ishikawa_causes: {
      "Mano de Obra": [],
      "Medio Ambiente": [],
      Maquinaria: [],
      Método: [],
      Materiales: [],
      Medida: [],
    },
    ishikawa_effect: "",
    target_vs_actual: [...DEFAULT_TARGET_VS_ACTUAL],
    target_vs_actual_unit: "",
    pareto_data_map: {},
    pareto_drill_downs: [],
    pareto_unit: "",
    autor: current_user?.name || "Sin autor",
    autor_email: current_user?.email || "",
    asignados: [],
    vpo_checkpoints: [...DEFAULT_VPO_CHECKPOINTS],
    definicion_meta: {
      kpi: "",
      pis: "",
      metodo_calculo: "",
      desde_valor: "",
      a_valor: "",
      hasta_fecha: "",
      unidad_medida: "",
      benchmark: "",
      mejora: "lower",
      responsable: "",
      facilitador_lider: "",
    },
    participantes: { ...DEFAULT_PARTICIPANTES },
    equipo: [],
    prioritization_causes: [],
    ishikawas: [],
    five_whys_tables: [],
    impact_matrix: [],
    has_flavor_correlation: false,
    flavor_correlation_data: [],
    has_gop_themes: false,
    gop_themes_data: [],
    comentarios: [],
    historial: [],
  };
}

/**
 * Mantiene y sincroniza el estado de borrador del PDCA activo dentro del diálogo de edición.
 *
 * @param initial_pdca - Documento PDCA seleccionado para editar o `null` para uno nuevo.
 * @param current_user - Usuario actual para poblar el autor si se crea un borrador nuevo.
 * @returns Estado `draft`, setter `set_draft` y helper parcial `update_draft`.
 */
export function usePdcaDraft(
  initial_pdca: Pdca | null,
  current_user?: { name?: string; email?: string },
) {
  const [draft, set_draft] = useState<Pdca>(
    initial_pdca ? { ...initial_pdca } : get_empty_draft(current_user),
  );

  // Resincronizar solo cuando cambia el ID del PDCA activo (evita reinicios al actualizar usuario).
  useEffect(() => {
    if (initial_pdca) {
      set_draft({ ...initial_pdca });
    } else {
      set_draft(get_empty_draft(current_user));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial_pdca?.id]);

  const update_draft = (updates: Partial<Pdca>) => {
    set_draft((previous_draft) => ({ ...previous_draft, ...updates }));
  };

  return { draft, set_draft, update_draft };
}
