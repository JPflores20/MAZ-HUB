/**
 * platform_rda_mapper.ts
 * Transforma documentos RDA de la plataforma MAZ HUB al modelo unificado
 * `RegistroAnalisis5WRda` para alimentar los tableros de Usabilidad y Severidad.
 */
import { get_rda_display_name } from "@/features/rda/utils/rda_name";
import { get_rda_status } from "@/features/rda/utils/rda_status";
import type { Rda } from "@/domain/models/rda";
import { calcular_puntaje_severidad } from "@/domain/calculators/usabilidad_calculators";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
} from "@/domain/models/usabilidad/usabilidad_types";
import { convertir_fecha_excel_a_iso } from "./excel_date_utils";

/**
 * Calcula la calificación IAL normalizada a decimal [0..1] a partir de la rúbrica de calidad del RDA.
 *
 * @param documento_rda - Documento RDA evaluado.
 * @returns Calificación normalizada a 4 decimales o `null` si aún no se evalúa.
 */
function calculate_rda_ial_score(documento_rda: Rda): number | null {
  if (!documento_rda.calidadRda) return null;

  const puntajes_rubrica = [
    Number(documento_rda.calidadRda.definicionProblema) || 0,
    Number(documento_rda.calidadRda.evidencia) || 0,
    Number(documento_rda.calidadRda.causaRaiz) || 0,
    Number(documento_rda.calidadRda.accionesCorrectivas) || 0,
    Number(documento_rda.calidadRda.validacionEfectividad) || 0,
  ];
  const suma_puntajes = puntajes_rubrica.reduce((acumulado, puntaje) => acumulado + puntaje, 0);
  if (suma_puntajes <= 0) return null;

  return suma_puntajes > 25
    ? Number((suma_puntajes / 100).toFixed(4))
    : Number((suma_puntajes / 25).toFixed(4));
}

/**
 * Convierte un único documento RDA al formato `RegistroAnalisis5WRda`.
 *
 * @param documento_rda - Documento RDA proveniente de Firestore.
 * @param indice_rda - Posición en el arreglo para asignar consecutivo estable.
 * @returns Registro listo para las tablas y métricas de Usabilidad/Severidad.
 */
export function map_rda_to_usabilidad_record(
  documento_rda: Rda,
  indice_rda: number,
): RegistroAnalisis5WRda {
  const estado_rda = get_rda_status(documento_rda);
  const estatus_analisis: "Completo" | "En Proceso" =
    estado_rda === "Cerrado" || estado_rda === "Evaluado" ? "Completo" : "En Proceso";

  const datos_fecha = convertir_fecha_excel_a_iso(
    documento_rda.context?.fecha || documento_rda.createdAt || new Date().toISOString(),
  );

  const pilares_sdca: MapaPilaresSdca = {
    owd: Boolean(documento_rda.standardization?.requiereOwd),
    skap: Boolean(documento_rda.standardization?.requiereCapacitacion),
    mapeo_proceso: Boolean(documento_rda.standardization?.requiereActualizarMapeo),
    sop_opl: Boolean(documento_rda.standardization?.requiereActualizarSop),
    sic: Boolean(documento_rda.standardization?.requiereMonitoreoIp),
    gops: Boolean(documento_rda.closure?.incluyeComoGop),
  };

  const minutos_paro = Number(documento_rda.context?.tiempoParo) || 0;
  const hectolitros_perdidos = Number(documento_rda.context?.perdidas) || 0;
  const volumen_no_conforme = Number(documento_rda.context?.productosNoConformes) || 0;

  const criterios_severidad: CriteriosSeveridad = {
    perdida_mayor_50hl: hectolitros_perdidos >= 50,
    tiempo_inactividad_mayor_3h: minutos_paro >= 180,
    volumen_destruir_retrabajo: volumen_no_conforme > 0,
    incidente_recurrente: documento_rda.analizadoEnOtrosReportes?.toUpperCase() === "SI",
    fallo_tecnico_inusual: false,
    volumen_bloqueado_apartado: volumen_no_conforme >= 50,
    impacto_planificacion: false,
  };

  const resultado_severidad = calcular_puntaje_severidad(criterios_severidad);

  return {
    id: `app-rda-${documento_rda.id}`,
    numero_consecutivo: 20000 + indice_rda + 1,
    semana_evento: datos_fecha.semana,
    mes_evento: datos_fecha.mes,
    anio_evento: datos_fecha.anio,
    fecha_evento: datos_fecha.fecha_iso,
    id_ial: documento_rda.context?.folio || documento_rda.id.slice(0, 8).toUpperCase(),
    descripcion_falla:
      get_rda_display_name(documento_rda) ||
      documento_rda.portada?.descripcionProblema ||
      "RDA en Plataforma",
    nombre_responsable: (
      documento_rda.context?.responsable ||
      documento_rda.portada?.autorOriginal ||
      "SIN ASIGNAR"
    ).toUpperCase(),
    calificacion_ial: calculate_rda_ial_score(documento_rda),
    kpi_afectado: (documento_rda.context?.disparador || "BPI").toUpperCase(),
    estatus_analisis,
    area_operativa: (
      documento_rda.context?.area ||
      documento_rda.portada?.area ||
      "COCIMIENTOS"
    ).toUpperCase(),
    proceso_cervecero:
      documento_rda.context?.etapa || documento_rda.context?.departamento || "Elaboración",
    equipo_afectado: (documento_rda.context?.equiposAfectados || "GENERAL").toUpperCase(),
    marca_cerveza: "NA",
    variable_afectada: documento_rda.efectividadRda?.indicadorEvaluado || "NA",
    tipo_herramienta: "RDA",
    pilares_sdca,
    criterios_severidad,
    porcentaje_severidad: resultado_severidad.porcentaje_severidad,
    clasificacion_incidente: resultado_severidad.clasificacion,
    estatus_reporte_incidente:
      resultado_severidad.clasificacion === "Incidente" ? "PENDIENTE" : "NA",
    origen_registro: "rda_app",
    id_documento_origen: documento_rda.id,
  };
}
