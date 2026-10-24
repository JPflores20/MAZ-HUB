/**
 * usabilidad_types.ts
 * Definición de tipos e interfaces en snake_case para los módulos de Usabilidad de Herramientas (5Ws, RDAs, PDCAs)
 * y Precursores / Incidentes de Proceso (Matriz de Severidad y Ciclo SDCA).
 */

export type TipoHerramienta = "5W" | "RDA" | "PDCA";

export type EstatusAnalisis = "Completo" | "En Proceso" | "Pendiente";

export type EstatusReporteIncidente = "NA" | "PENDIENTE" | "ENVIADO";

export type ClasificacionSeveridad = "Incidente" | "Precursor";

export type OrigenRegistroUsabilidad =
  | "excel_base"
  | "importado"
  | "manual"
  | "rda_app"
  | "pdca_app";

export type ClavePilarSdca =
  | "owd"
  | "skap"
  | "cinco_s"
  | "mapeo_proceso"
  | "arbol_kpi"
  | "sop_opl"
  | "plan_reaccion"
  | "gops"
  | "bom"
  | "partes_refacciones"
  | "material_defectuoso"
  | "sic";

export interface MapaPilaresSdca {
  owd?: boolean | undefined;
  skap?: boolean | undefined;
  cinco_s?: boolean | undefined;
  mapeo_proceso?: boolean | undefined;
  arbol_kpi?: boolean | undefined;
  sop_opl?: boolean | undefined;
  plan_reaccion?: boolean | undefined;
  gops?: boolean | undefined;
  bom?: boolean | undefined;
  partes_refacciones?: boolean | undefined;
  material_defectuoso?: boolean | undefined;
  sic?: boolean | undefined;
}

export interface CriteriosSeveridad {
  /** Pérdida >50 HL de Cerveza/Mosto [100 pts] */
  perdida_mayor_50hl: boolean;
  /** Tiempo de Inactividad >3h [50 pts] */
  tiempo_inactividad_mayor_3h: boolean;
  /** Volumen a destruir o retrabajo [50 pts] */
  volumen_destruir_retrabajo: boolean;
  /** Incidente recurrente [50 pts] */
  incidente_recurrente: boolean;
  /** Fallo técnico inusual [50 pts] */
  fallo_tecnico_inusual: boolean;
  /** Volumen Bloqueado/Apartado [100 pts] */
  volumen_bloqueado_apartado: boolean;
  /** Impacto en planificación [100 pts] */
  impacto_planificacion: boolean;
}

export interface RubricaCalidad5W {
  /** 1. Toda la información requerida está completa (disparador correcto - detalles del problema - acciones iniciales) */
  informacion_completa: boolean;
  /** 2. Se cumplió con el flujo de resolución de problemas (participaron las personas adecuadas) */
  flujo_cumplido: boolean;
  /** 3. La resolución del problema se llevó a cabo con la primera línea (operadores y técnicos) */
  primera_linea_involucrada: boolean;
  /** 4. Todos los por-qués cuentan con una evidencia */
  evidencia_por_ques: boolean;
  /** 5. La secuencia de la resolución de problemas tiene sentido */
  secuencia_logica: boolean;
  /** 6. Se encontró la verdadera causa raíz */
  causa_raiz_encontrada: boolean;
  /** 7. Se proponen acciones de eliminación de la causa raíz y cierre del ciclo */
  acciones_cierre_ciclo: boolean;
  /** Comentarios de retroalimentación para mejoras */
  comentarios_mejora?: string | undefined;
  /** Nombre del evaluador que registró la calificación */
  evaluado_por?: string | undefined;
}

export interface RegistroAnalisis5WRda {
  id: string;
  numero_consecutivo: number;
  semana_evento: number;
  mes_evento: number;
  anio_evento: number;
  /** Fecha en formato ISO YYYY-MM-DD */
  fecha_evento: string;
  id_ial: string;
  descripcion_falla: string;
  nombre_responsable: string;
  /** Calificación decimal de 0 a 1 (ej. 0.8571 = 85.71%) */
  calificacion_ial: number | null;
  kpi_afectado: string;
  estatus_analisis: EstatusAnalisis;
  area_operativa: string;
  proceso_cervecero: string;
  equipo_afectado: string;
  marca_cerveza: string;
  variable_afectada: string;
  tipo_herramienta: TipoHerramienta;
  pilares_sdca: MapaPilaresSdca;
  criterios_severidad: CriteriosSeveridad;
  /** Puntaje calculado: 0 a 500 */
  porcentaje_severidad: number;
  /** Clasificación automática: "Incidente" (>=100) o "Precursor" (<100) */
  clasificacion_incidente: ClasificacionSeveridad;
  /** Estado del reporte de incidente: "NA", "PENDIENTE", "ENVIADO" */
  estatus_reporte_incidente: EstatusReporteIncidente;
  /** Rúbrica detallada de 7 puntos (Hoja1 o evaluada en plataforma) */
  rubrica_5w?: RubricaCalidad5W | undefined;
  /** Fuente del registro */
  origen_registro?: OrigenRegistroUsabilidad | undefined;
  /** ID de documento original si proviene de RDA o PDCA de la app */
  id_documento_origen?: string | undefined;
}

export interface ResumenReporteIncidente {
  id: string;
  titulo_hoja: string;
  planta_ubicacion: string;
  contacto_responsable: string;
  nivel_severidad: string;
  fecha_ocurrencia: string;
  marca_afectada: string;
  fecha_reporte: string;
  volumen_no_conforme: string;
  condicion_conductora: string;
  detalles_incidente: string;
  causas_principales: string;
  acciones_preventivas: string;
}

export interface EstadisticasKpiUsabilidad {
  total_registros: number;
  conteo_5w: number;
  conteo_rda: number;
  conteo_pdca: number;
  conteo_completos: number;
  conteo_en_proceso: number;
  porcentaje_cierre: number;
  promedio_calidad_ial: number;
  conteo_auditados: number;
}

export interface ResumenDeudorResponsable {
  nombre_responsable: string;
  area_operativa: string;
  total_asignados: number;
  total_completos: number;
  total_en_proceso: number;
  conteo_5w: number;
  conteo_rda_pdca: number;
  porcentaje_cierre: number;
  promedio_calificacion: number | null;
}

export interface EstadisticasSeveridad {
  total_eventos: number;
  total_incidentes: number;
  total_precursores: number;
  precursores_alerta_50pts: number;
  pendientes_reporte_qir: number;
}
