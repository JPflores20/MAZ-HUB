/**
 * use_usabilidad_data.ts
 * Hook principal que unifica los registros del Excel base ("08. Analisis de 5Ws y RDAs.xlsx"),
 * los archivos importados de Interaction Log, los registros manuales y los RDAs/PDCAs de MAZ HUB.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  calcular_puntaje_rubrica_5w,
  calcular_puntaje_severidad,
} from "@/domain/calculators/usabilidad_calculators";
import type {
  RegistroAnalisis5WRda,
  ResumenReporteIncidente,
  RubricaCalidad5W,
} from "@/domain/models/usabilidad/usabilidad_types";
import {
  cargar_excel_base_usabilidad,
  parsear_libro_excel_usabilidad,
} from "@/shared/services/usabilidad/bd_matriz_parser";
import { mapear_rdas_y_pdcas_a_registros } from "@/shared/services/usabilidad/platform_sync_service";
import {
  guardar_override_registro,
  guardar_registros_personalizados,
  obtener_overrides_registros,
  obtener_registros_personalizados,
} from "@/shared/services/usabilidad/usabilidad_storage_service";

/**
 * Consolida los registros históricos de Excel, importaciones, overrides locales y documentos vivos
 * de la plataforma, exponiendo acciones mutadoras de rúbrica y severidad.
 *
 * @returns Estado unificado de registros, contadores de fuente y handlers de actualización.
 */
export function useUsabilidadData() {
  const { allPdcas: todos_los_pdcas } = usePdcas();
  const { allRdas: todos_los_rdas } = useRdas();

  const [registros_base_excel, set_registros_base_excel] = useState<RegistroAnalisis5WRda[]>([]);
  const [reportes_incidentes_qir, set_reportes_incidentes_qir] = useState<
    ResumenReporteIncidente[]
  >([]);
  const [registros_personalizados, set_registros_personalizados] = useState<
    RegistroAnalisis5WRda[]
  >(() => obtener_registros_personalizados());
  const [diccionario_overrides, set_diccionario_overrides] = useState<
    Record<string, Partial<RegistroAnalisis5WRda>>
  >(() => obtener_overrides_registros());
  const [cargando_excel_base, set_cargando_excel_base] = useState(true);
  const [incluir_documentos_plataforma, set_incluir_documentos_plataforma] = useState(true);

  useEffect(() => {
    let componente_montado = true;
    set_cargando_excel_base(true);
    cargar_excel_base_usabilidad()
      .then((resultado_excel) => {
        if (!componente_montado) return;
        set_registros_base_excel(resultado_excel.registros_analisis);
        set_reportes_incidentes_qir(resultado_excel.reportes_incidentes);
      })
      .catch((error_carga) => {
        console.error("Error cargando Excel base de usabilidad:", error_carga);
      })
      .finally(() => {
        if (componente_montado) set_cargando_excel_base(false);
      });
    return () => {
      componente_montado = false;
    };
  }, []);

  const registros_plataforma = useMemo(() => {
    if (!incluir_documentos_plataforma) return [];
    return mapear_rdas_y_pdcas_a_registros(todos_los_rdas, todos_los_pdcas);
  }, [todos_los_rdas, todos_los_pdcas, incluir_documentos_plataforma]);

  const todos_los_registros = useMemo(() => {
    const lista_combinada = [
      ...registros_personalizados,
      ...registros_plataforma,
      ...registros_base_excel,
    ];
    return lista_combinada.map((registro_actual) => {
      const parche_override = diccionario_overrides[registro_actual.id];
      return parche_override ? { ...registro_actual, ...parche_override } : registro_actual;
    });
  }, [registros_personalizados, registros_plataforma, registros_base_excel, diccionario_overrides]);

  const agregar_registro_manual = useCallback(
    (nuevo_registro: RegistroAnalisis5WRda) => {
      const lista_actualizada = [nuevo_registro, ...registros_personalizados];
      set_registros_personalizados(lista_actualizada);
      guardar_registros_personalizados(lista_actualizada);
      toast.success("Registro agregado correctamente a la matriz.");
    },
    [registros_personalizados],
  );

  const importar_archivo_excel = useCallback(
    async (archivo_subido: File) => {
      try {
        const buffer_archivo = await archivo_subido.arrayBuffer();
        const resultado_parseo = parsear_libro_excel_usabilidad(buffer_archivo);
        if (resultado_parseo.registros_analisis.length === 0) {
          toast.error("No se encontraron registros válidos en las hojas 'BD' ni 'Hoja1'.");
          return 0;
        }
        const registros_etiquetados = resultado_parseo.registros_analisis.map(
          (registro_importado, indice_registro) => ({
            ...registro_importado,
            id: `imp-${Date.now()}-${indice_registro}`,
            origen_registro: "importado" as const,
          }),
        );
        const lista_actualizada = [...registros_etiquetados, ...registros_personalizados];
        set_registros_personalizados(lista_actualizada);
        guardar_registros_personalizados(lista_actualizada);
        toast.success(
          `Se importaron ${registros_etiquetados.length} registros desde ${archivo_subido.name}.`,
        );
        return registros_etiquetados.length;
      } catch (error_importacion) {
        console.error("Error al importar archivo Excel:", error_importacion);
        toast.error("Error al procesar el archivo Excel.");
        return 0;
      }
    },
    [registros_personalizados],
  );

  const actualizar_rubrica_registro = useCallback(
    (id_registro: string, rubrica_evaluada: RubricaCalidad5W) => {
      const puntaje_calculado = calcular_puntaje_rubrica_5w(rubrica_evaluada);
      guardar_override_registro(id_registro, {
        rubrica_5w: rubrica_evaluada,
        calificacion_ial: puntaje_calculado,
      });
      set_diccionario_overrides(obtener_overrides_registros());
      toast.success(`Evaluación 5W guardada (${Math.round(puntaje_calculado * 100)}%).`);
    },
    [],
  );

  const actualizar_parche_registro = useCallback(
    (id_registro: string, parche_cambios: Partial<RegistroAnalisis5WRda>) => {
      const parche_final = { ...parche_cambios };
      if (parche_cambios.criterios_severidad) {
        const resultado_severidad = calcular_puntaje_severidad(parche_cambios.criterios_severidad);
        parche_final.porcentaje_severidad = resultado_severidad.porcentaje_severidad;
        parche_final.clasificacion_incidente = resultado_severidad.clasificacion;
        if (resultado_severidad.clasificacion === "Precursor") {
          parche_final.estatus_reporte_incidente = "NA";
        } else if (
          !parche_final.estatus_reporte_incidente ||
          parche_final.estatus_reporte_incidente === "NA"
        ) {
          parche_final.estatus_reporte_incidente = "PENDIENTE";
        }
      }
      guardar_override_registro(id_registro, parche_final);
      set_diccionario_overrides(obtener_overrides_registros());
      toast.success("Registro actualizado correctamente.");
    },
    [],
  );

  const limpiar_registros_importados = useCallback(() => {
    set_registros_personalizados([]);
    guardar_registros_personalizados([]);
    toast.info("Registros manuales e importados restablecidos al Excel base.");
  }, []);

  return {
    todos_los_registros,
    conteo_registros_base: registros_base_excel.length,
    conteo_registros_personalizados: registros_personalizados.length,
    conteo_registros_plataforma: registros_plataforma.length,
    reportes_incidentes_qir,
    cargando_excel_base,
    incluir_documentos_plataforma,
    set_incluir_documentos_plataforma,
    agregar_registro_manual,
    importar_archivo_excel,
    actualizar_rubrica_registro,
    actualizar_parche_registro,
    limpiar_registros_importados,
  };
}
