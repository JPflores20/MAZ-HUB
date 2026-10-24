/**
 * pre-incidentes-proceso.tsx
 * Orquestador modular de la ruta "/pre-incidentes-proceso": Matriz Maestra BD de Precursores
 * e Incidentes de Proceso, Calculadora de Severidad, Análisis de Variables y Reportes QIR.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Calculator, FileWarning, SlidersHorizontal } from "lucide-react";
import React, { useMemo, useState } from "react";

import { ModalEditarSeveridad } from "@/components/pre_incidentes/modal_editar_severidad";
import { type FormularioNuevoPrecursor, ModalNuevoPrecursor } from "@/components/pre_incidentes/modal_nuevo_precursor";
import { PreIncidentesFiltrosBar } from "@/components/pre_incidentes/pre_incidentes_filtros_bar";
import { PreIncidentesHeaderBanner } from "@/components/pre_incidentes/pre_incidentes_header_banner";
import { PreIncidentesKpiCards } from "@/components/pre_incidentes/pre_incidentes_kpi_cards";
import { TabAnalisisVariablesCharts } from "@/components/pre_incidentes/tab_analisis_variables_charts";
import { TabMatrizSeveridadTable } from "@/components/pre_incidentes/tab_matriz_severidad_table";
import { TabReportesQirCards } from "@/components/pre_incidentes/tab_reportes_qir_cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/auth/auth-context";
import { calcular_puntaje_severidad } from "@/data/usabilidad/usabilidad_calculators";
import { CRITERIOS_SEVERIDAD_VACIOS } from "@/data/usabilidad/usabilidad_catalogs";
import type { CriteriosSeveridad, EstatusReporteIncidente, MapaPilaresSdca, RegistroAnalisis5WRda } from "@/data/usabilidad/usabilidad_types";
import { use_estadisticas_pre_incidentes } from "@/hooks/usabilidad/use_estadisticas_pre_incidentes";
import { use_usabilidad_data } from "@/hooks/usabilidad/use_usabilidad_data";
import { convertir_fecha_excel_a_iso } from "@/services/usabilidad/excel_date_utils";

export const Route = createFileRoute("/pre-incidentes-proceso")({
  head: () => ({
    meta: [
      { title: "Matriz de Precursores e Incidentes de Proceso · MAZ HUB" },
      { name: "description", content: "Matriz de Precursores e Incidentes de Proceso (5Ws, RDA), evaluación de severidad y reportes QIR." },
    ],
  }),
  component: PaginaPreIncidentesProceso,
});

function PaginaPreIncidentesProceso() {
  const { currentUser: usuario_actual } = useAuth();
  const { todos_los_registros, reportes_incidentes_qir, cargando_excel_base, agregar_registro_manual, actualizar_parche_registro } = use_usabilidad_data();

  const [texto_busqueda, set_texto_busqueda] = useState("");
  const [area_seleccionada, set_area_seleccionada] = useState("ALL");
  const [clasificacion_seleccionada, set_clasificacion_seleccionada] = useState("ALL");
  const [anio_seleccionado, set_anio_seleccionado] = useState("ALL");

  const [registro_en_edicion, set_registro_en_edicion] = useState<RegistroAnalisis5WRda | null>(null);
  const [borrador_severidad, set_borrador_severidad] = useState<CriteriosSeveridad>({ ...CRITERIOS_SEVERIDAD_VACIOS });
  const [borrador_sdca, set_borrador_sdca] = useState<MapaPilaresSdca>({});
  const [borrador_estatus_qir, set_borrador_estatus_qir] = useState<EstatusReporteIncidente>("NA");

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
    const anios = new Set<number>();
    todos_los_registros.forEach((r) => { if (r.anio_evento) anios.add(r.anio_evento); });
    return Array.from(anios).sort((a, b) => b - a);
  }, [todos_los_registros]);

  const registros_filtrados = useMemo(() => {
    const consulta = texto_busqueda.trim().toLowerCase();
    return todos_los_registros.filter((r) => {
      if (anio_seleccionado !== "ALL" && String(r.anio_evento) !== anio_seleccionado) return false;
      if (area_seleccionada !== "ALL" && r.area_operativa !== area_seleccionada) return false;
      if (clasificacion_seleccionada !== "ALL" && r.clasificacion_incidente !== clasificacion_seleccionada) return false;
      if (!consulta) return true;
      return [r.descripcion_falla, r.nombre_responsable, r.proceso_cervecero, r.equipo_afectado, r.variable_afectada, r.id_ial]
        .some((campo) => campo.toLowerCase().includes(consulta));
    });
  }, [todos_los_registros, anio_seleccionado, area_seleccionada, clasificacion_seleccionada, texto_busqueda]);

  const {
    estadisticas_severidad,
    datos_top_variables_afectadas,
    datos_activacion_criterios,
  } = use_estadisticas_pre_incidentes(registros_filtrados);

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
      nombre_responsable: datos_formulario_nuevo.nombre_responsable.trim().toUpperCase() || "SIN ASIGNAR",
      equipo_afectado: datos_formulario_nuevo.equipo_afectado.trim().toUpperCase(),
      calificacion_ial: null,
      porcentaje_severidad: calculo.porcentaje_severidad,
      clasificacion_incidente: calculo.clasificacion,
      estatus_reporte_incidente: calculo.clasificacion === "Incidente" ? "PENDIENTE" : "NA",
      origen_registro: "manual",
    });
    set_modal_nuevo_abierto(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <PreIncidentesHeaderBanner on_abrir_modal_nuevo={() => set_modal_nuevo_abierto(true)} />
      <PreIncidentesFiltrosBar
        texto_busqueda={texto_busqueda}
        on_cambiar_busqueda={set_texto_busqueda}
        clasificacion_seleccionada={clasificacion_seleccionada}
        on_cambiar_clasificacion={set_clasificacion_seleccionada}
        area_seleccionada={area_seleccionada}
        on_cambiar_area={set_area_seleccionada}
        anio_seleccionado={anio_seleccionado}
        on_cambiar_anio={set_anio_seleccionado}
        anios_disponibles={anios_disponibles}
      />
      <PreIncidentesKpiCards estadisticas_severidad={estadisticas_severidad} cargando_excel_base={cargando_excel_base} />

      <Tabs defaultValue="matriz" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 bg-muted/70 p-1">
          <TabsTrigger value="matriz" className="py-2 font-semibold">
            <Calculator className="size-4 mr-2" /> 1. Matriz BD y Calculadora de Severidad
          </TabsTrigger>
          <TabsTrigger value="analisis" className="py-2 font-semibold">
            <SlidersHorizontal className="size-4 mr-2" /> 2. Análisis de Precursores por Variable y Criterio
          </TabsTrigger>
          <TabsTrigger value="qir" className="py-2 font-semibold">
            <FileWarning className="size-4 mr-2" /> 3. Reportes de Incidente de Proceso (QIR Oficiales)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="matriz">
          <TabMatrizSeveridadTable registros_filtrados={registros_filtrados} on_abrir_editar_severidad={abrir_editar_severidad} />
        </TabsContent>
        <TabsContent value="analisis">
          <TabAnalisisVariablesCharts datos_top_variables_afectadas={datos_top_variables_afectadas} datos_activacion_criterios={datos_activacion_criterios} />
        </TabsContent>
        <TabsContent value="qir">
          <TabReportesQirCards reportes_incidentes_qir={reportes_incidentes_qir} />
        </TabsContent>
      </Tabs>

      <ModalEditarSeveridad
        registro_en_edicion={registro_en_edicion}
        borrador_severidad={borrador_severidad}
        on_cambiar_severidad={set_borrador_severidad}
        borrador_sdca={borrador_sdca}
        on_cambiar_sdca={set_borrador_sdca}
        borrador_estatus_qir={borrador_estatus_qir}
        on_cambiar_estatus_qir={set_borrador_estatus_qir}
        on_cerrar_modal={() => set_registro_en_edicion(null)}
        on_guardar_cambios={guardar_edicion_severidad}
      />
      <ModalNuevoPrecursor
        esta_abierto={modal_nuevo_abierto}
        on_cambiar_abierto={set_modal_nuevo_abierto}
        datos_formulario={datos_formulario_nuevo}
        on_cambiar_formulario={set_datos_formulario_nuevo}
        on_enviar_formulario={crear_nuevo_registro}
      />
    </div>
  );
}
