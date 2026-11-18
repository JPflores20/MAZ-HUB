/**
 * @fileoverview Hook de estado para herramientas analíticas y tablas técnicas del PDCA.
 */
import { useState } from "react";
import type {
  ActionItem,
  AnalisisRiesgoItem,
  ColeccionDatosItem,
  ConclusionCausaRaizItem,
  FiveWhysTableData,
  GopThemeItem,
  ImpactMatrixRow,
  IshikawaItem,
  Pdca,
  PruebaEjecutadaItem,
  VozDelConsumidorItem,
} from "@/domain/pdca";
import type { MultiEvidenciaSolucionItem } from "../do/paso_19/evidencias_solucion_step";
import type { AnalisisRiesgoProcesoItem } from "../plan/paso_6/analisis_riesgos_proceso_table";
import type { DatosCorrelacionSabor } from "../plan/paso_11_flavor_correlation/flavor_correlation_utils";
import {
  normalizar_ishikawas_iniciales,
  normalizar_tablas_cinco_porques,
  normalizar_temas_gop_iniciales,
} from "./pdca_tools_normalizers";

/**
 * Gestiona el estado React de 5 Porqués, Ishikawa, Temas GOP, SIPOC, Riesgos, VOC y Acciones.
 */
export const use_estado_pdca_herramientas = (pdca_inicial: Pdca) => {
  const [tablas_cinco_porques, set_tablas_cinco_porques] = useState<FiveWhysTableData[]>(() =>
    normalizar_tablas_cinco_porques(pdca_inicial),
  );
  const [matriz_impacto, set_matriz_impacto] = useState<ImpactMatrixRow[]>(
    pdca_inicial.impactMatrix || [],
  );
  const [ishikawas_generales, set_ishikawas_generales] = useState<IshikawaItem[]>(() =>
    normalizar_ishikawas_iniciales(pdca_inicial),
  );
  const [conceptos_ishikawa, set_conceptos_ishikawa] = useState<Record<string, string>>(
    pdca_inicial.ishikawaConceptos || pdca_inicial.ishikawa_conceptos || {},
  );
  const [elementos_accion, set_elementos_accion] = useState<ActionItem[]>(
    pdca_inicial.acciones || [],
  );

  const [tiene_correlacion_sabor, set_tiene_correlacion_sabor] = useState<boolean>(
    pdca_inicial.hasFlavorCorrelation ?? pdca_inicial.has_flavor_correlation ?? false,
  );
  const [datos_correlacion_sabor, set_datos_correlacion_sabor] =
    useState<DatosCorrelacionSabor | null>(() => {
      const crudo = pdca_inicial.flavorCorrelationData ?? pdca_inicial.flavor_correlation_data ?? null;
      return Array.isArray(crudo) ? null : (crudo as DatosCorrelacionSabor | null);
    });

  const [tiene_temas_gop, set_tiene_temas_gop] = useState<boolean>(
    pdca_inicial.hasGopThemes ?? pdca_inicial.has_gop_themes ?? false,
  );
  const [datos_temas_gop, set_datos_temas_gop] = useState<GopThemeItem[]>(
    () => normalizar_temas_gop_iniciales(pdca_inicial) as unknown as GopThemeItem[],
  );

  const [archivos_mapeo_procesos, set_archivos_mapeo_procesos] = useState<string[]>(
    pdca_inicial.processMappingFiles ||
      (pdca_inicial.processMappingImage ? [pdca_inicial.processMappingImage] : []),
  );
  const [tiene_mapeo_procesos, set_tiene_mapeo_procesos] = useState<boolean>(
    pdca_inicial.hasMapeoProceso ?? pdca_inicial.has_mapeo_proceso ?? false,
  );
  const [imagen_mapeo_proceso, set_imagen_mapeo_proceso] = useState<string | undefined>(
    pdca_inicial.mapeoProcesoImage || pdca_inicial.mapeo_proceso_image,
  );
  const [descripcion_mapeo_proceso, set_descripcion_mapeo_proceso] = useState<string | undefined>(
    pdca_inicial.mapeoProcesoDesc || pdca_inicial.mapeo_proceso_desc,
  );

  const [archivos_mapa_sipoc, set_archivos_mapa_sipoc] = useState<string[]>(
    pdca_inicial.sipocMapFiles || pdca_inicial.sipoc_map_files || [],
  );
  const [datos_coleccion, set_datos_coleccion] = useState<ColeccionDatosItem[]>(
    pdca_inicial.coleccionDatos || pdca_inicial.coleccion_datos || [],
  );

  const [texto_especificacion_procesos, set_texto_especificacion_procesos] = useState<
    string | undefined
  >(pdca_inicial.especificacionProcesosText || pdca_inicial.especificacion_procesos_text);
  const [imagen_especificacion_procesos, set_imagen_especificacion_procesos] = useState<
    string | undefined
  >(pdca_inicial.especificacionProcesosImage || pdca_inicial.especificacion_procesos_image);

  const [datos_voz_consumidor, set_datos_voz_consumidor] = useState<VozDelConsumidorItem[]>(
    pdca_inicial.vozConsumidor || pdca_inicial.voz_consumidor || [],
  );
  const [riesgos_proyecto_analizados, set_riesgos_proyecto_analizados] = useState<
    AnalisisRiesgoItem[]
  >(pdca_inicial.analisisRiesgosProyecto || pdca_inicial.analisis_riesgos_proyecto || []);
  const [riesgos_estandarizacion_analizados, set_riesgos_estandarizacion_analizados] = useState<
    AnalisisRiesgoProcesoItem[]
  >(
    (pdca_inicial.analisisRiesgosEstandarizacion ||
      pdca_inicial.analisis_riesgos_estandarizacion ||
      []) as unknown as AnalisisRiesgoProcesoItem[],
  );

  const [conclusiones_causa_raiz_encontradas, set_conclusiones_causa_raiz_encontradas] = useState<
    ConclusionCausaRaizItem[]
  >(pdca_inicial.conclusionesCausaRaiz || pdca_inicial.conclusiones_causa_raiz || []);
  const [evidencias_solucion_implementada, set_evidencias_solucion_implementada] = useState<
    MultiEvidenciaSolucionItem[]
  >(pdca_inicial.evidenciasSolucion || pdca_inicial.evidencias_solucion || []);
  const [pruebas_ejecutadas_fase_check, set_pruebas_ejecutadas_fase_check] = useState<
    PruebaEjecutadaItem[]
  >(pdca_inicial.pruebasEjecutadas || pdca_inicial.pruebas_ejecutadas || []);
  const [archivos_analisis_estadistico, set_archivos_analisis_estadistico] = useState<string[]>(
    pdca_inicial.statisticalAnalysisFiles || [],
  );
  const [archivos_informacion_adicional, set_archivos_informacion_adicional] = useState<string[]>(
    pdca_inicial.informacionAdicionalFiles || pdca_inicial.informacion_adicional_files || [],
  );

  return {
    tablas_cinco_porques,
    set_tablas_cinco_porques,
    matriz_impacto,
    set_matriz_impacto,
    ishikawas_generales,
    set_ishikawas_generales,
    conceptos_ishikawa,
    set_conceptos_ishikawa,
    elementos_accion,
    set_elementos_accion,
    tiene_correlacion_sabor,
    set_tiene_correlacion_sabor,
    datos_correlacion_sabor,
    set_datos_correlacion_sabor,
    tiene_temas_gop,
    set_tiene_temas_gop,
    datos_temas_gop,
    set_datos_temas_gop,
    archivos_mapeo_procesos,
    set_archivos_mapeo_procesos,
    tiene_mapeo_procesos,
    set_tiene_mapeo_procesos,
    imagen_mapeo_proceso,
    set_imagen_mapeo_proceso,
    descripcion_mapeo_proceso,
    set_descripcion_mapeo_proceso,
    archivos_mapa_sipoc,
    set_archivos_mapa_sipoc,
    datos_coleccion,
    set_datos_coleccion,
    texto_especificacion_procesos,
    set_texto_especificacion_procesos,
    imagen_especificacion_procesos,
    set_imagen_especificacion_procesos,
    datos_voz_consumidor,
    set_datos_voz_consumidor,
    riesgos_proyecto_analizados,
    set_riesgos_proyecto_analizados,
    riesgos_estandarizacion_analizados,
    set_riesgos_estandarizacion_analizados,
    conclusiones_causa_raiz_encontradas,
    set_conclusiones_causa_raiz_encontradas,
    evidencias_solucion_implementada,
    set_evidencias_solucion_implementada,
    pruebas_ejecutadas_fase_check,
    set_pruebas_ejecutadas_fase_check,
    archivos_analisis_estadistico,
    set_archivos_analisis_estadistico,
    archivos_informacion_adicional,
    set_archivos_informacion_adicional,
  };
};
