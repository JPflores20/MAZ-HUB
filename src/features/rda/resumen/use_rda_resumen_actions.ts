/**
 * @fileoverview Custom hook encapsulating inline mutation callbacks for Fase 1 Resumen.
 */

import { useMemo } from "react";
import { toast } from "sonner";
import { crear_fila_accion_vacia } from "@/features/pdca/do/paso_18/action_plan_utils";
import type {
  Rda,
  RdaAnomalyContext,
  RdaProblemDescription,
  RdaValidationAction,
} from "@/domain/models/rda";
import { get_rda_name } from "../utils/rda_name";
import {
  import_ishikawa_causes_to_validation,
  sync_root_causes_to_pda,
} from "../utils/rda_root_cause_sync";

/** Builds typed inline edit callbacks for all editable tables in RdaPhase1Resumen. */
export function useRdaResumenActions(rda: Rda, on_change?: (rda: Rda) => void) {
  const is_editable = Boolean(on_change);
  const effect_topic = get_rda_name(rda) || rda.title || "Anomalía RDA";

  const responsibles_list = useMemo(() => {
    const from_context = (rda.context?.responsable || "")
      .split(",")
      .map((person) => person.trim())
      .filter(Boolean);
    if (from_context.length > 0) return from_context;
    return (rda.portada?.usuariosAsignados || []).map((person) => person.trim()).filter(Boolean);
  }, [rda.context?.responsable, rda.portada?.usuariosAsignados]);

  const handle_context_change = (field_name: keyof RdaAnomalyContext, value: string) => {
    if (!on_change) return;
    on_change({ ...rda, context: { ...rda.context, [field_name]: value } });
  };

  const toggle_responsible = (person_name: string) => {
    if (!on_change) return;
    const normalized = person_name.trim();
    if (!normalized) return;
    const exists = responsibles_list.some((item) => item.toLowerCase() === normalized.toLowerCase());
    const next_list = exists
      ? responsibles_list.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
      : [...responsibles_list, normalized];
    handle_context_change("responsable", next_list.join(", "));
  };

  const add_custom_responsible = (custom_name: string) => {
    if (!responsibles_list.some((item) => item.toLowerCase() === custom_name.toLowerCase())) {
      handle_context_change("responsable", [...responsibles_list, custom_name].join(", "));
    }
  };

  const handle_problem_desc_change = (field_name: keyof RdaProblemDescription, value: string) => {
    if (!on_change) return;
    on_change({
      ...rda,
      problemDescription: {
        que: "",
        como: "",
        cuando: "",
        donde: "",
        quien: "",
        cual: "",
        ...(rda.problemDescription || {}),
        [field_name]: value,
      },
    });
  };

  const handle_immediate_action_change = (value: string) => {
    if (!on_change) return;
    const current_list = rda.immediateActions ? [...rda.immediateActions] : [];
    const first_existing = current_list[0];
    if (!first_existing) {
      current_list.push({
        id: `imm-${Date.now()}`,
        categoria: "Máquina",
        causaPotencial: "",
        accion: value,
        responsable: rda.context?.responsable || "",
        fechaLimite: rda.context?.fecha || "",
        estatus: "En progreso",
        esCausaRaiz: "NO",
      });
    } else {
      current_list[0] = { ...first_existing, accion: value };
    }
    on_change({ ...rda, immediateActions: current_list });
  };

  const handle_validation_change = (updated_actions: RdaValidationAction[]) => {
    if (!on_change) return;
    const { nextPda } = sync_root_causes_to_pda(
      updated_actions,
      rda.pda || [],
      effect_topic,
      rda.validationActions || [],
    );
    on_change({ ...rda, validationActions: updated_actions, pda: nextPda });
  };

  const handle_add_validation_row = () => {
    handle_validation_change([
      ...(rda.validationActions || []),
      {
        id: `val-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        categoria: "Máquina",
        causaPotencial: "",
        accion: "",
        responsable: "",
        fechaLimite: "",
        estatus: "Pendiente",
        esCausaRaiz: "Pendiente",
      },
    ]);
  };

  const handle_import_validation = () => {
    if (!on_change) return;
    const { next_actions, added_count } = import_ishikawa_causes_to_validation(rda);
    if (added_count === 0) {
      toast.info("No se encontraron causas nuevas en el Diagrama de Ishikawa para importar.");
      return;
    }
    handle_validation_change(next_actions);
    toast.success(`Se importaron ${added_count} causa(s) del Ishikawa al Plan de Validación.`);
  };

  const handle_add_pda_row = () => {
    if (!on_change) return;
    on_change({
      ...rda,
      pda: [...(rda.pda || []), { ...crear_fila_accion_vacia(), tema: effect_topic }],
    });
  };

  const handle_toggle_checklist_item = (item_id: string) => {
    if (!on_change) return;
    const current_flag = Boolean(rda.checklistEstandarizacion?.[item_id]);
    on_change({
      ...rda,
      checklistEstandarizacion: {
        ...(rda.checklistEstandarizacion || {}),
        [item_id]: !current_flag,
      },
    });
  };

  return {
    is_editable,
    responsibles_list,
    handle_context_change,
    toggle_responsible,
    add_custom_responsible,
    handle_problem_desc_change,
    handle_immediate_action_change,
    handle_validation_change,
    handle_add_validation_row,
    handle_import_validation,
    handle_add_pda_row,
    handle_toggle_checklist_item,
  };
}
