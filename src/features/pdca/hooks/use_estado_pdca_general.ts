/**
 * @fileoverview Hook de estado general, metadatos, asignados, equipo y control de pasos completados del PDCA.
 */
import { useState } from "react";
import {
  DEFAULT_PARTICIPANTES,
  type ParticipantesData,
  type Pdca,
  type PdcaComment,
  type PdcaHistoryEvent,
  type Phase,
} from "@/domain/pdca";
import { parse_date_string } from "../utils/date_helpers";

/**
 * Inicializa y administra los metadatos generales, comentarios, historial y avance de pasos del PDCA.
 */
export const use_estado_pdca_general = (
  pdca_inicial: Pdca,
  usuario_actual: { name?: string; email?: string } | null,
) => {
  const [pestana_activa, set_pestana_activa] = useState<Phase>("Resumen");
  const [titulo_proyecto, set_titulo_proyecto] = useState<string>(pdca_inicial.titulo || "");
  const [planta_proyecto, set_planta_proyecto] = useState<string>(
    pdca_inicial.planta || "Zacatecas",
  );
  const [departamento_proyecto, set_departamento_proyecto] = useState<string>(
    pdca_inicial.departamento || "",
  );
  const [area_proyecto, set_area_proyecto] = useState<string>(pdca_inicial.area || "Cocimientos");
  const [etapa_proyecto, set_etapa_proyecto] = useState<string>(pdca_inicial.etapa || "");
  const [problema_declarado, set_problema_declarado] = useState<string>(
    pdca_inicial.problema || "",
  );
  const [causa_raiz_identificada, set_causa_raiz_identificada] = useState<string>(
    pdca_inicial.causaRaiz || "",
  );

  const [lista_comentarios, set_lista_comentarios] = useState<PdcaComment[]>(
    pdca_inicial.comentarios || [],
  );
  const [historial_eventos, set_historial_eventos] = useState<PdcaHistoryEvent[]>(
    pdca_inicial.historial || [],
  );
  const [pestana_inferior_activa, set_pestana_inferior_activa] = useState<"comments" | "history">(
    "comments",
  );

  const [fecha_limite, set_fecha_limite] = useState<Date | undefined>(() =>
    parse_date_string(pdca_inicial.fechaFinalizacion),
  );
  const [nombre_autor, set_nombre_autor] = useState<string>(
    pdca_inicial.autor || usuario_actual?.name || "Usuario",
  );
  const [correo_autor, set_correo_autor] = useState<string>(
    pdca_inicial.autorEmail || usuario_actual?.email || "",
  );
  const [usuarios_asignados, set_usuarios_asignados] = useState<{ name: string; email: string }[]>(
    pdca_inicial.asignados || [],
  );

  const [fases_completadas, set_fases_completadas] = useState<Set<string>>(
    new Set(pdca_inicial.completedPhases || []),
  );
  const [pasos_completados, set_pasos_completados] = useState<Set<string>>(
    new Set(pdca_inicial.completedSteps || pdca_inicial.completed_steps || []),
  );
  const [pasos_no_aplica, set_pasos_no_aplica] = useState<Set<string>>(
    new Set(pdca_inicial.naSteps || pdca_inicial.na_steps || []),
  );

  const [miembros_equipo, set_miembros_equipo] = useState<string[]>(pdca_inicial.equipo || []);
  const [datos_participantes, set_datos_participantes] = useState<ParticipantesData>(
    pdca_inicial.participantes || DEFAULT_PARTICIPANTES,
  );

  return {
    pestana_activa,
    set_pestana_activa,
    titulo_proyecto,
    set_titulo_proyecto,
    planta_proyecto,
    set_planta_proyecto,
    departamento_proyecto,
    set_departamento_proyecto,
    area_proyecto,
    set_area_proyecto,
    etapa_proyecto,
    set_etapa_proyecto,
    problema_declarado,
    set_problema_declarado,
    causa_raiz_identificada,
    set_causa_raiz_identificada,
    lista_comentarios,
    set_lista_comentarios,
    historial_eventos,
    set_historial_eventos,
    pestana_inferior_activa,
    set_pestana_inferior_activa,
    fecha_limite,
    set_fecha_limite,
    nombre_autor,
    set_nombre_autor,
    correo_autor,
    set_correo_autor,
    usuarios_asignados,
    set_usuarios_asignados,
    fases_completadas,
    set_fases_completadas,
    pasos_completados,
    set_pasos_completados,
    pasos_no_aplica,
    set_pasos_no_aplica,
    miembros_equipo,
    set_miembros_equipo,
    datos_participantes,
    set_datos_participantes,
  };
};
