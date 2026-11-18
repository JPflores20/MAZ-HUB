/**
 * @fileoverview Definición de propiedades compartidas entre las subfases y pasos de la Fase PLAN del PDCA.
 */
import type {
  DefinicionMeta,
  ParticipantesData,
  VpoCheckpointItem,
  ParetoItem,
  IshikawaItem,
  FiveWhysTableData,
  GopThemeItem,
  RendimientoActualPiItem,
  ColeccionDatosItem,
  VozDelConsumidorItem,
  AnalisisRiesgoItem,
  ConclusionCausaRaizItem,
} from "@/domain/pdca";
import type { DatosCorrelacionSabor } from "./paso_11_flavor_correlation/flavor_correlation_utils";

export interface UsuarioPlan {
  name: string;
  email: string;
}

export interface PuntoSituacionActual {
  mes: string;
  target: number;
  actual: number | null;
}

/**
 * Propiedades completas del componente orquestador de la Fase PLAN (`PdcaPhasePlan`) y sus subfases.
 */
export interface PhasePlanProps {
  title_value: string;
  on_title_change: (valor: string) => void;
  planta_value?: string | undefined;
  on_planta_change?: ((valor: string) => void) | undefined;
  departamento_value?: string | undefined;
  on_departamento_change?: ((valor: string) => void) | undefined;
  area_value: string;
  on_area_change: (valor: string) => void;
  etapa_value?: string | undefined;
  on_etapa_change?: ((valor: string) => void) | undefined;
  deadline_date?: Date;
  on_deadline_change: (fecha?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, nombre: string) => void;
  assigned_users: UsuarioPlan[];
  on_toggle_assigned_user: (usuario: UsuarioPlan) => void;
  available_users: UsuarioPlan[];
  is_admin_user: boolean;
  team_members_list: string[];
  on_team_members_change: (miembros: string[]) => void;
  problem_description: string;
  on_problem_change: (valor: string) => void;
  goal_definition: DefinicionMeta;
  on_goal_definition_change: (meta: DefinicionMeta) => void;
  participants_info: ParticipantesData;
  on_participants_info_change: (participantes: ParticipantesData) => void;
  vpo_checkpoints: VpoCheckpointItem[];
  on_vpo_checkpoints_change: (checkpoints: VpoCheckpointItem[]) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string>;
  on_toggle_step: (paso_id: string) => void;
  on_toggle_na?: (paso_id: string) => void;
  is_editable: boolean;
  process_mapping_files?: string[] | undefined;
  sipoc_map_files?: string[] | undefined;
  on_sipoc_map_files_change?: ((archivos: string[]) => void) | undefined;
  on_process_mapping_files_change?: ((archivos: string[]) => void) | undefined;
  baseline_image?: string | undefined;
  on_baseline_image_change?: ((imagen_url: string | undefined) => void) | undefined;
  coleccion_datos?: ColeccionDatosItem[] | undefined;
  on_coleccion_datos_change?: ((registros: ColeccionDatosItem[]) => void) | undefined;
  pareto_drill_downs?: string[] | undefined;
  on_pareto_drill_downs_change?: ((niveles: string[]) => void) | undefined;
  pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  on_pareto_data_map_change?: ((mapa: Record<string, ParetoItem[]>) => void) | undefined;
  pareto_unit?: string | undefined;
  on_pareto_unit_change?: ((unidad: string) => void) | undefined;
  pareto_titles?: Record<string, string> | undefined;
  on_pareto_titles_change?: ((titulos: Record<string, string>) => void) | undefined;
  target_vs_actual?: PuntoSituacionActual[] | undefined;
  on_target_vs_actual_change?: ((puntos: PuntoSituacionActual[]) => void) | undefined;
  target_vs_actual_unit?: string | undefined;
  on_target_vs_actual_unit_change?: ((unidad: string) => void) | undefined;
  target_vs_actual_title?: string | undefined;
  on_target_vs_actual_title_change?: ((titulo: string) => void) | undefined;
  target_vs_actual_ymin?: number | undefined;
  on_target_vs_actual_ymin_change?: ((valor: number) => void) | undefined;
  target_vs_actual_ymax?: string | undefined;
  on_target_vs_actual_ymax_change?: ((valor: string) => void) | undefined;
  ishikawas?: IshikawaItem[] | undefined;
  on_ishikawas_change?: ((diagramas: IshikawaItem[]) => void) | undefined;
  five_whys_tables?: FiveWhysTableData[] | undefined;
  on_five_whys_tables_change?: ((tablas: FiveWhysTableData[]) => void) | undefined;
  voz_consumidor?: VozDelConsumidorItem[] | undefined;
  on_voz_consumidor_change?: ((registros: VozDelConsumidorItem[]) => void) | undefined;
  analisis_riesgos_proyecto?: AnalisisRiesgoItem[] | undefined;
  on_analisis_riesgos_proyecto_change?: ((registros: AnalisisRiesgoItem[]) => void) | undefined;
  especificacion_procesos_image?: string | undefined;
  on_especificacion_procesos_image_change?: ((imagen_url?: string) => void) | undefined;
  benchmark_image?: string | undefined;
  on_benchmark_image_change?: ((imagen_url?: string) => void) | undefined;
  conclusiones_causa_raiz?: ConclusionCausaRaizItem[] | undefined;
  on_conclusiones_causa_raiz_change?: ((conclusiones: ConclusionCausaRaizItem[]) => void) | undefined;
  on_send_root_causes_to_action_plan?: ((conclusiones: ConclusionCausaRaizItem[]) => void) | undefined;
  has_flavor_correlation?: boolean | undefined;
  set_has_flavor_correlation?: ((habilitado: boolean) => void) | undefined;
  flavor_correlation_data?: DatosCorrelacionSabor | null | undefined;
  on_flavor_correlation_data_change?: (datos: DatosCorrelacionSabor) => void;
  on_force_save?: () => void;
  gop_themes_data?: GopThemeItem[] | undefined;
  on_gop_themes_data_change?: ((temas: GopThemeItem[]) => void) | undefined;
  rendimiento_actual_pis?: RendimientoActualPiItem[] | undefined;
  on_rendimiento_actual_pis_change?: ((indicadores: RendimientoActualPiItem[]) => void) | undefined;
  rendimiento_actual_image?: string | undefined;
  on_rendimiento_actual_image_change?: ((imagen_url: string | undefined) => void) | undefined;
}
