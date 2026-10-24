/**
 * usabilidad_catalogs.ts
 * Catálogos oficiales VPO extraídos de la hoja "Datos" del archivo "08. Analisis de 5Ws y RDAs.xlsx".
 */
import type { ClavePilarSdca, CriteriosSeveridad, RubricaCalidad5W } from "./usabilidad_types";

export const CATALOGO_PILARES_SDCA: {
  clave: ClavePilarSdca;
  etiqueta_completa: string;
  etiqueta_corta: string;
}[] = [
  { clave: "owd", etiqueta_completa: "OWD (Diagnóstico de Trabajo Operacional)", etiqueta_corta: "OWD" },
  { clave: "skap", etiqueta_completa: "Capacitación (SKAP)", etiqueta_corta: "SKAP" },
  { clave: "cinco_s", etiqueta_completa: "5S", etiqueta_corta: "5S" },
  { clave: "mapeo_proceso", etiqueta_completa: "Mapeo de Proceso", etiqueta_corta: "Mapeo Proceso" },
  { clave: "arbol_kpi", etiqueta_completa: "Árbol KPI", etiqueta_corta: "Árbol KPI" },
  { clave: "sop_opl", etiqueta_completa: "SOP / OPL", etiqueta_corta: "SOP/OPL" },
  { clave: "plan_reaccion", etiqueta_completa: "Plan de Reacción", etiqueta_corta: "Plan Reacción" },
  { clave: "gops", etiqueta_completa: "GOPs (Buenas Prácticas Operativas)", etiqueta_corta: "GOPs" },
  { clave: "bom", etiqueta_completa: "BOM (Lista de Materiales)", etiqueta_corta: "BOM" },
  { clave: "partes_refacciones", etiqueta_completa: "Partes y Refacciones", etiqueta_corta: "Partes y Ref." },
  { clave: "material_defectuoso", etiqueta_completa: "Material Defectuoso", etiqueta_corta: "Mat. Defectuoso" },
  { clave: "sic", etiqueta_completa: "SIC (Control de Intervalo Corto)", etiqueta_corta: "SIC" },
];

export const CATALOGO_CRITERIOS_SEVERIDAD: {
  clave: keyof CriteriosSeveridad;
  etiqueta: string;
  puntos: 100 | 50;
}[] = [
  { clave: "perdida_mayor_50hl", etiqueta: "Pérdida >50 HL de Cerveza/Mosto", puntos: 100 },
  { clave: "tiempo_inactividad_mayor_3h", etiqueta: "Tiempo de Inactividad >3h", puntos: 50 },
  { clave: "volumen_destruir_retrabajo", etiqueta: "Volumen a destruir o retrabajo", puntos: 50 },
  { clave: "incidente_recurrente", etiqueta: "Incidente recurrente", puntos: 50 },
  { clave: "fallo_tecnico_inusual", etiqueta: "Fallo técnico inusual", puntos: 50 },
  { clave: "volumen_bloqueado_apartado", etiqueta: "Volumen Bloqueado/Apartado", puntos: 100 },
  { clave: "impacto_planificacion", etiqueta: "Impacto en planificación", puntos: 100 },
];

export const PREGUNTAS_RUBRICA_5W: {
  clave: keyof Omit<RubricaCalidad5W, "comentarios_mejora" | "evaluado_por">;
  descripcion_completa: string;
  titulo_corto: string;
}[] = [
  {
    clave: "informacion_completa",
    descripcion_completa:
      "Toda la información requerida está completa (disparador correcto - detalles del problema - acciones iniciales)",
    titulo_corto: "1. Información completa",
  },
  {
    clave: "flujo_cumplido",
    descripcion_completa:
      "Se cumplió con el flujo de resolución de problemas (participaron las personas adecuadas)",
    titulo_corto: "2. Flujo de resolución",
  },
  {
    clave: "primera_linea_involucrada",
    descripcion_completa:
      "La resolución del problema se llevó a cabo con la primera línea (operadores y técnicos)",
    titulo_corto: "3. Primera línea involucrada",
  },
  {
    clave: "evidencia_por_ques",
    descripcion_completa: "Todos los por-qués cuentan con una evidencia",
    titulo_corto: "4. Evidencia en los Por-qués",
  },
  {
    clave: "secuencia_logica",
    descripcion_completa: "La secuencia de la resolución de problemas tiene sentido",
    titulo_corto: "5. Secuencia lógica",
  },
  {
    clave: "causa_raiz_encontrada",
    descripcion_completa: "Se encontró la verdadera causa raíz",
    titulo_corto: "6. Causa raíz verdadera",
  },
  {
    clave: "acciones_cierre_ciclo",
    descripcion_completa:
      "Se proponen acciones de eliminación de la causa raíz y cierre del ciclo.",
    titulo_corto: "7. Acciones y cierre SDCA",
  },
];

export const CRITERIOS_SEVERIDAD_VACIOS: CriteriosSeveridad = {
  perdida_mayor_50hl: false,
  tiempo_inactividad_mayor_3h: false,
  volumen_destruir_retrabajo: false,
  incidente_recurrente: false,
  fallo_tecnico_inusual: false,
  volumen_bloqueado_apartado: false,
  impacto_planificacion: false,
};

export const CATALOGO_AREAS = [
  "COCIMIENTOS",
  "CUARTOS FRIOS",
  "FERMENTACION-REPOSO",
  "FILTROS-GOBIERNO",
] as const;

export const CATALOGO_PROCESOS = [
  "Molienda", "Disolucion de Grits", "Cocción", "Maceracion",
  "Filtracion de Mosto", "Ebullicion", "Reposo de Mosto", "Enfriamiento de Mosto",
  "Manejo de Levadura", "Fermentacion", "CMF", "Reposo",
  "CIP Coctos", "CIP Bloque Frio", "Filtracion de Cerveza", "Estabilización de Cerveza",
  "BBT", "Multiblender", "Recepción de Malta", "Lupulado de Mosto",
  "Carga de Bagazo", "Envio de Cerveza a Envasado",
] as const;

export const CATALOGO_MARCAS = [
  "CORONA", "CORONA EP", "MOD", "MOD EXP", "NEGRA MOD", "MOD PURAMALTA",
  "VIC", "VICKYS", "PAC", "PAC LIGHT", "BL", "BUDWEISER", "MU",
  "ESTRELLA DE JALISCO", "COR LIGHT", "COR LIGHT SHINE", "COR LIGHT EXP",
  "BARRILITO", "SELTKZER", "RIFADAS", "NA",
] as const;

export const CATALOGO_KPIS = [
  "BHT", "BHGLY", "BPI", "FCI", "FSI", "GLY", "TEL", "SENSORY",
  "AGUA", "TERMICO", "DOWN TIME ENVASADO", "APARTADO", "TRI", "GFSI",
  "TTP", "BACKLOG", "PERDIDA DE COCIMIENTOS",
] as const;

export const CATALOGO_VARIABLES = [
  "Exposición al riesgo", "Tiempo de filtración", "Color", "°P", "pH", "EMO",
  "Temp de Llenado", "Tiempo de Llenado", "Conteo al Llenar", "Aireacion",
  "UH", "Amargor", "AV", "AP", "CO2", "Oxigeno disuelto", "Turbidez",
  "Volumen perdido", "Consumo de agua", "Consumo de vapor", "Tiempo de reposo",
  "Tiempo de bombeo de olla", "Eficiencia", "Perdida de Cocimiento",
  "Congelamiento de Cerveza", "Particulas Suspendidas", "Fermentacion Acelerada",
  "Fermentacion Incompleta", "Temperatura de arranque macerador", "NA",
] as const;

export const NOMBRES_MESES: Record<number, string> = {
  1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
};
