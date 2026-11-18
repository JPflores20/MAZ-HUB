/**
 * @fileoverview Main view orchestrator for `/pre-incidentes-proceso` managing severity matrix and QIR tabs.
 */

import { Calculator, FileWarning, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ModalEditarSeveridad } from "./modal_editar_severidad";
import { ModalNuevoPrecursor } from "./modal_nuevo_precursor";
import { PreIncidentesFiltrosBar } from "./pre_incidentes_filtros_bar";
import { PreIncidentesHeaderBanner } from "./pre_incidentes_header_banner";
import { PreIncidentesKpiCards } from "./pre_incidentes_kpi_cards";
import { TabAnalisisVariablesCharts } from "./tab_analisis_variables_charts";
import { TabMatrizSeveridadTable } from "./tab_matriz_severidad_table";
import { TabReportesQirCards } from "./tab_reportes_qir_cards";
import { usePreIncidentesView } from "./use_pre_incidentes_view";

/** Renders the Process Precursors & Incidents Matrix page with 3 analytical tabs and modals. */
export function PreIncidentesProcesoView() {
  const {
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
  } = usePreIncidentesView();

  const {
    estadisticas_severidad,
    datos_top_variables_afectadas,
    datos_activacion_criterios,
  } = estadisticas;

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
      <PreIncidentesKpiCards
        estadisticas_severidad={estadisticas_severidad}
        cargando_excel_base={cargando_excel_base}
      />

      <Tabs defaultValue="matriz" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 bg-muted/70 p-1">
          <TabsTrigger value="matriz" className="py-2 font-semibold">
            <Calculator className="size-4 mr-2" /> 1. Matriz BD y Calculadora de Severidad
          </TabsTrigger>
          <TabsTrigger value="analisis" className="py-2 font-semibold">
            <SlidersHorizontal className="size-4 mr-2" /> 2. Análisis de Precursores por Variable y
            Criterio
          </TabsTrigger>
          <TabsTrigger value="qir" className="py-2 font-semibold">
            <FileWarning className="size-4 mr-2" /> 3. Reportes de Incidente de Proceso (QIR
            Oficiales)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="matriz">
          <TabMatrizSeveridadTable
            registros_filtrados={registros_filtrados}
            on_abrir_editar_severidad={abrir_editar_severidad}
          />
        </TabsContent>
        <TabsContent value="analisis">
          <TabAnalisisVariablesCharts
            datos_top_variables_afectadas={datos_top_variables_afectadas}
            datos_activacion_criterios={datos_activacion_criterios}
          />
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
