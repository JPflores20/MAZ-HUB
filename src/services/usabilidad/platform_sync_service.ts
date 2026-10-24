/**
 * platform_sync_service.ts
 * Servicio de sincronización en vivo que transforma los documentos RDA y PDCA creados
 * en la plataforma MAZ HUB a registros compatibles con las matrices de Usabilidad y Severidad.
 */
import { getRdaDisplayName } from "@/components/RDA/rda-name";
import { getRdaStatus } from "@/components/RDA/rda-status";
import type { Pdca } from "@/data/pdca";
import type { Rda } from "@/data/rda";
import { calcular_puntaje_severidad } from "@/data/usabilidad/usabilidad_calculators";
import { CRITERIOS_SEVERIDAD_VACIOS } from "@/data/usabilidad/usabilidad_catalogs";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
} from "@/data/usabilidad/usabilidad_types";
import { convertir_fecha_excel_a_iso } from "./excel_date_utils";

/**
 * Convierte un arreglo de RDAs y PDCAs activos de la plataforma al modelo unificado RegistroAnalisis5WRda.
 */
export function mapear_rdas_y_pdcas_a_registros(
  lista_rdas: Rda[],
  lista_pdcas: Pdca[],
): RegistroAnalisis5WRda[] {
  const registros_mapeados: RegistroAnalisis5WRda[] = [];

  lista_rdas.forEach((documento_rda, indice_rda) => {
    const estado_rda = getRdaStatus(documento_rda);
    const estatus_analisis: "Completo" | "En Proceso" =
      estado_rda === "Cerrado" || estado_rda === "Evaluado" ? "Completo" : "En Proceso";

    const datos_fecha = convertir_fecha_excel_a_iso(
      documento_rda.context?.fecha ||
        documento_rda.createdAt ||
        new Date().toISOString(),
    );

    let calificacion_ial: number | null = null;
    if (documento_rda.calidadRda) {
      const puntajes_rubrica = [
        Number(documento_rda.calidadRda.definicionProblema) || 0,
        Number(documento_rda.calidadRda.evidencia) || 0,
        Number(documento_rda.calidadRda.causaRaiz) || 0,
        Number(documento_rda.calidadRda.accionesCorrectivas) || 0,
        Number(documento_rda.calidadRda.validacionEfectividad) || 0,
      ];
      const suma_puntajes = puntajes_rubrica.reduce((acum, actual) => acum + actual, 0);
      if (suma_puntajes > 0) {
        calificacion_ial =
          suma_puntajes > 25
            ? Number((suma_puntajes / 100).toFixed(4))
            : Number((suma_puntajes / 25).toFixed(4));
      }
    }

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
    const volumen_no_conforme =
      Number(documento_rda.context?.productosNoConformes) || 0;

    const criterios_severidad: CriteriosSeveridad = {
      perdida_mayor_50hl: hectolitros_perdidos >= 50,
      tiempo_inactividad_mayor_3h: minutos_paro >= 180,
      volumen_destruir_retrabajo: volumen_no_conforme > 0,
      incidente_recurrente:
        documento_rda.analizadoEnOtrosReportes?.toUpperCase() === "SI",
      fallo_tecnico_inusual: false,
      volumen_bloqueado_apartado: volumen_no_conforme >= 50,
      impacto_planificacion: false,
    };

    const resultado_severidad = calcular_puntaje_severidad(criterios_severidad);

    registros_mapeados.push({
      id: `app-rda-${documento_rda.id}`,
      numero_consecutivo: 20000 + indice_rda + 1,
      semana_evento: datos_fecha.semana,
      mes_evento: datos_fecha.mes,
      anio_evento: datos_fecha.anio,
      fecha_evento: datos_fecha.fecha_iso,
      id_ial:
        documento_rda.context?.folio || documento_rda.id.slice(0, 8).toUpperCase(),
      descripcion_falla:
        getRdaDisplayName(documento_rda) ||
        documento_rda.portada?.descripcionProblema ||
        "RDA en Plataforma",
      nombre_responsable: (
        documento_rda.context?.responsable ||
        documento_rda.portada?.autorOriginal ||
        "SIN ASIGNAR"
      ).toUpperCase(),
      calificacion_ial,
      kpi_afectado: (documento_rda.context?.disparador || "BPI").toUpperCase(),
      estatus_analisis,
      area_operativa: (
        documento_rda.context?.area ||
        documento_rda.portada?.area ||
        "COCIMIENTOS"
      ).toUpperCase(),
      proceso_cervecero:
        documento_rda.context?.etapa ||
        documento_rda.context?.departamento ||
        "Elaboración",
      equipo_afectado: (
        documento_rda.context?.equiposAfectados || "GENERAL"
      ).toUpperCase(),
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
    });
  });

  lista_pdcas.forEach((documento_pdca, indice_pdca) => {
    const estatus_analisis: "Completo" | "En Proceso" =
      documento_pdca.fase === "Act" ? "Completo" : "En Proceso";
    const datos_fecha = convertir_fecha_excel_a_iso(
      documento_pdca.actualizado || new Date().toISOString(),
    );

    const filas_estandarizacion = documento_pdca.tablaEstandarizacion || [];
    const texto_herramientas_vpo = filas_estandarizacion
      .map((item) => String(item.herramientaVpo || "").toUpperCase())
      .join(" ");

    const pilares_sdca: MapaPilaresSdca = {
      sop_opl:
        texto_herramientas_vpo.includes("SOP") ||
        texto_herramientas_vpo.includes("OPL"),
      skap:
        texto_herramientas_vpo.includes("SKAP") ||
        texto_herramientas_vpo.includes("ENTRENAMIENTO"),
      owd: texto_herramientas_vpo.includes("OWD"),
      mapeo_proceso:
        Boolean(documento_pdca.mapeoProcesoImage) ||
        texto_herramientas_vpo.includes("MAP"),
      arbol_kpi: Boolean(documento_pdca.kpiTreeFocoImage),
      gops: (documento_pdca.gopThemesData || []).length > 0,
      sic:
        (documento_pdca.rendimientoActualPis || []).length > 0 ||
        texto_herramientas_vpo.includes("SIC"),
    };

    registros_mapeados.push({
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
    });
  });

  return registros_mapeados;
}
