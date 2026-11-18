/**
 * @fileoverview Custom hook managing filters, severity editing, and manual event creation for Pre-Incidentes.
 */

import type React from "react";
import { useMemo, useState } from "react";
import { calcular_puntaje_severidad } from "@/domain/calculators/usabilidad_calculators";
import { CRITERIOS_SEVERIDAD_VACIOS } from "@/domain/constants/usabilidad_catalogs";
import type {
  CriteriosSeveridad,
  EstatusReporteIncidente,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
} from "@/domain/models/usabilidad/usabilidad_types";
import { useAuth } from "@/features/auth/auth_context";
import { useEstadisticasPreIncidentes } from "@/shared/hooks/usabilidad/use_estadisticas_pre_incidentes";
import { useUsabilidadData } from "@/shared/hooks/usabilidad/use_usabilidad_data";
import { convertir_fecha_excel_a_iso } from "@/shared/services/usabilidad/excel_date_utils";
import type { FormularioNuevoPrecursor } from "./modal_nuevo_precursor";

/** Encapsulates Master BD filtering, Severity Matrix edits, and new precursor registration. */
export function usePreIncidentesView() {
  const { currentUser: usuario_actual } = useAuth();
  const {
    todos_los_registros,
    reportes_incidentes_qir,
    cargando_excel_base,
    agregar_registro_manual,
    actualizar_parche_registro,
  } = useUsabilidadData();

  const [texto_busqueda, set_texto_busqueda] = useState("");
  const [area_seleccionada, set_area_seleccionada] = useState("ALL");
  const [clasificacion_seleccionada, set_clasificacion_seleccionada] = useState("ALL");
  const [anio_seleccionado, set_anio_seleccionado] = useState("ALL");

  const [registro_en_edicion, set_registro_en_edicion] =
    useState<RegistroAnalisis5WRda | null>(null);
  const [borrador_severidad, set_borrador_severidad] = useState<CriteriosSeveridad>({
    ...CRITERIOS_SEVERIDAD_VACIOS,
  });
  const [borrador_sdca, set_borrador_sdca] = useState<MapaPilaresSdca>({});
  const [borrador_estatus_qir, set_borrador_estatus_qir] =
    useState<EstatusReporteIncidente>("NA");

  const [modal_nuevo_abierto, set_modal_nuevo_abierto] = useState(false);
  const [datos_formulario_nuevo, set_datos_formulario_nuevo] = useState<FormularioNuevoPrecursor>({
    fecha_evento: new Date().toISOString().slice(0, 10),
    id_ial: "",
    descripcion_falla: "",
    nombre_responsable: usuario_actual?.name || "",
    tipo_herramienta: "5W",
    estatus_analisis: "Completo",
    area_operativa: "COCIMIENTOS",
    proceso_cervecero: "Filtracion de Mosto",
    equipo_afectado: "FILTRO LAUTER",
    marca_cerveza: "CORONA",
    variable_afectada: "Tiempo de filtración",
    kpi_afectado: "BHT",
    criterios_severidad: { ...CRITERIOS_SEVERIDAD_VACIOS },
    pilares_sdca: {},
  });

  const anios_disponibles = useMemo(() => {
    const conjunto_anios = new Set<number>();
    todos_los_registros.forEach((registro) => {
      if (registro.anio_evento) conjunto_anios.add(registro.anio_evento);
    });
    return Array.from(conjunto_anios).sort((anio_a, anio_b) => anio_b - anio_a);
  }, [todos_los_registros]);

  const registros_filtrados = useMemo(() => {
    const consulta = texto_busqueda.trim().toLowerCase();
    return todos_los_registros.filter((registro) => {
      if (anio_seleccionado !== "ALL" && String(registro.anio_evento) !== anio_seleccionado) {
        return false;
      }
      if (area_seleccionada !== "ALL" && registro.area_operativa !== area_seleccionada) {
        return false;
      }
      if (
        clasificacion_seleccionada !== "ALL" &&
        registro.clasificacion_incidente !== clasificacion_seleccionada
      ) {
        return false;
      }
      if (!consulta) return true;
      return [
        registro.descripcion_falla,
        registro.nombre_responsable,
        registro.proceso_cervecero,
        registro.equipo_afectado,
        registro.variable_afectada,
        registro.id_ial,
      ].some((campo) => campo.toLowerCase().includes(consulta));
    });
  }, [
    todos_los_registros,
    anio_seleccionado,
    area_seleccionada,
    clasificacion_seleccionada,
    texto_busqueda,
  ]);

  const estadisticas = useEstadisticasPreIncidentes(registros_filtrados);

  const abrir_editar_severidad = (registro: RegistroAnalisis5WRda) => {
    set_registro_en_edicion(registro);
    set_borrador_severidad({ ...(registro.criterios_severidad || CRITERIOS_SEVERIDAD_VACIOS) });
    set_borrador_sdca({ ...(registro.pilares_sdca || {}) });
    set_borrador_estatus_qir(registro.estatus_reporte_incidente || "NA");
  };

  const guardar_edicion_severidad = () => {
    if (!registro_en_edicion) return;
    actualizar_parche_registro(registro_en_edicion.id, {
      criterios_severidad: borrador_severidad,
      pilares_sdca: borrador_sdca,
      estatus_reporte_incidente: borrador_estatus_qir,
    });
    set_registro_en_edicion(null);
  };

  const crear_nuevo_registro = (evento: React.FormEvent) => {
    evento.preventDefault();
    const datos_fecha = convertir_fecha_excel_a_iso(datos_formulario_nuevo.fecha_evento);
    const calculo = calcular_puntaje_severidad(datos_formulario_nuevo.criterios_severidad);

    agregar_registro_manual({
      ...datos_formulario_nuevo,
      id: `manual-${Date.now()}`,
      numero_consecutivo: todos_los_registros.length + 1,
      semana_evento: datos_fecha.semana,
      mes_evento: datos_fecha.mes,
      anio_evento: datos_fecha.anio,
      fecha_evento: datos_fecha.fecha_iso,
      id_ial: datos_formulario_nuevo.id_ial.trim(),
      descripcion_falla: datos_formulario_nuevo.descripcion_falla.trim() || "Desviación de proceso",
      nombre_responsable:
        datos_formulario_nuevo.nombre_responsable.trim().toUpperCase() || "SIN ASIGNAR",
      equipo_afectado: datos_formulario_nuevo.equipo_afectado.trim().toUpperCase(),
      calificacion_ial: null,
      porcentaje_severidad: calculo.porcentaje_severidad,
      clasificacion_incidente: calculo.clasificacion,
      estatus_reporte_incidente: calculo.clasificacion === "Incidente" ? "PENDIENTE" : "NA",
      origen_registro: "manual",
    });
    set_modal_nuevo_abierto(false);
  };

  return {
    reportes_incidentes_qir,
    cargando_excel_base,
    texto_busqueda,
    set_texto_busqueda,
    area_seleccionada,
    set_area_seleccionada,
    clasificacion_seleccionada,
    set_clasificacion_seleccionada,
    anio_seleccionado,
    set_anio_seleccionado,
    anios_disponibles,
    registros_filtrados,
    estadisticas,
    registro_en_edicion,
    set_registro_en_edicion,
    borrador_severidad,
    set_borrador_severidad,
    borrador_sdca,
    set_borrador_sdca,
    borrador_estatus_qir,
    set_borrador_estatus_qir,
    modal_nuevo_abierto,
    set_modal_nuevo_abierto,
    datos_formulario_nuevo,
    set_datos_formulario_nuevo,
    abrir_editar_severidad,
    guardar_edicion_severidad,
    crear_nuevo_registro,
  };
}
