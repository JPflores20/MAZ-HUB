/**
 * platform_pdca_mapper.ts
 * Transforma documentos PDCA de la plataforma MAZ HUB al modelo unificado
 * `RegistroAnalisis5WRda` para alimentar la matriz y métricas de Usabilidad.
 */
import type { Pdca } from "@/domain/pdca";
import { CRITERIOS_SEVERIDAD_VACIOS } from "@/domain/constants/usabilidad_catalogs";
import type {
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
} from "@/domain/models/usabilidad/usabilidad_types";
import { convertir_fecha_excel_a_iso } from "./excel_date_utils";

/**
 * Convierte un único documento PDCA al formato `RegistroAnalisis5WRda`.
 *
 * @param documento_pdca - Documento PDCA proveniente de Firestore.
 * @param indice_pdca - Posición en el arreglo para asignar consecutivo estable.
 * @returns Registro compatible con el tablero de Usabilidad.
 */
export function map_pdca_to_usabilidad_record(
  documento_pdca: Pdca,
  indice_pdca: number,
): RegistroAnalisis5WRda {
  const estatus_analisis: "Completo" | "En Proceso" =
    documento_pdca.fase === "Act" ? "Completo" : "En Proceso";
  const datos_fecha = convertir_fecha_excel_a_iso(
    documento_pdca.actualizado || new Date().toISOString(),
  );

  const filas_estandarizacion = documento_pdca.tablaEstandarizacion || [];
  const texto_herramientas_vpo = filas_estandarizacion
    .map((fila_estandarizacion) => String(fila_estandarizacion.herramientaVpo || "").toUpperCase())
    .join(" ");

  const pilares_sdca: MapaPilaresSdca = {
    sop_opl:
      texto_herramientas_vpo.includes("SOP") || texto_herramientas_vpo.includes("OPL"),
    skap:
      texto_herramientas_vpo.includes("SKAP") ||
      texto_herramientas_vpo.includes("ENTRENAMIENTO"),
    owd: texto_herramientas_vpo.includes("OWD"),
    mapeo_proceso:
      Boolean(documento_pdca.mapeoProcesoImage) || texto_herramientas_vpo.includes("MAP"),
    arbol_kpi: Boolean(documento_pdca.kpiTreeFocoImage),
    gops: (documento_pdca.gopThemesData || []).length > 0,
    sic:
      (documento_pdca.rendimientoActualPis || []).length > 0 ||
      texto_herramientas_vpo.includes("SIC"),
  };

  return {
    id: `app-pdca-${documento_pdca.id}`,
    numero_consecutivo: 30000 + indice_pdca + 1,
    semana_evento: datos_fecha.semana,
    mes_evento: datos_fecha.mes,
    anio_evento: datos_fecha.anio,
    fecha_evento: datos_fecha.fecha_iso,
    id_ial: documento_pdca.id,
    descripcion_falla:
      documento_pdca.titulo || documento_pdca.problema || "Ciclo PDCA",
    nombre_responsable: (documento_pdca.autor || "SIN ASIGNAR").toUpperCase(),
    calificacion_ial: documento_pdca.progreso
      ? Number((documento_pdca.progreso / 100).toFixed(4))
      : null,
    kpi_afectado: (documento_pdca.definicionMeta?.kpi || "KPI").toUpperCase(),
    estatus_analisis,
    area_operativa: (documento_pdca.area || "COCIMIENTOS").toUpperCase(),
    proceso_cervecero:
      documento_pdca.etapa || documento_pdca.departamento || "Elaboración",
    equipo_afectado: "PLANTA",
    marca_cerveza: "NA",
    variable_afectada: documento_pdca.definicionMeta?.pis || "NA",
    tipo_herramienta: "PDCA",
    pilares_sdca,
    criterios_severidad: { ...CRITERIOS_SEVERIDAD_VACIOS },
    porcentaje_severidad: 0,
    clasificacion_incidente: "Precursor",
    estatus_reporte_incidente: "NA",
    origen_registro: "pdca_app",
    id_documento_origen: documento_pdca.id,
  };
}
