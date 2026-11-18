/**
 * @fileoverview Main view orchestrator for `/usabilidad-htas` combining charts, debtor table, and 5W audit.
 */

import { BarChart3, ClipboardCheck, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ModalEvaluarRubrica5W } from "./modal_evaluar_rubrica_5w";
import { TabAuditoria5WTable } from "./tab_auditoria_5w_table";
import { TabDeudoresTable } from "./tab_deudores_table";
import { TabGraficosUsabilidad } from "./tab_graficos_usabilidad";
import { UsabilidadFiltrosBar } from "./usabilidad_filtros_bar";
import { UsabilidadHeaderBanner } from "./usabilidad_header_banner";
import { UsabilidadKpiCards } from "./usabilidad_kpi_cards";
import { useUsabilidadView } from "./use_usabilidad_view";

/** Renders the Tool Usability module with multi-criteria filters, 3 analytical tabs, and rubric modal. */
export function UsabilidadHerramientasView() {
  const {
    conteo_registros_personalizados,
    conteo_registros_plataforma,
    cargando_excel_base,
    incluir_documentos_plataforma,
    set_incluir_documentos_plataforma,
    importar_archivo_excel,
    limpiar_registros_importados,
    anio_seleccionado,
    set_anio_seleccionado,
    mes_seleccionado,
    set_mes_seleccionado,
    area_seleccionada,
    set_area_seleccionada,
    herramienta_seleccionada,
    set_herramienta_seleccionada,
    texto_busqueda,
    set_texto_busqueda,
    anios_disponibles,
    areas_disponibles,
    registros_filtrados,
    estadisticas,
    registro_en_evaluacion,
    set_registro_en_evaluacion,
    borrador_rubrica,
    set_borrador_rubrica,
    abrir_modal_rubrica,
    guardar_evaluacion_rubrica,
  } = useUsabilidadView();

  const {
    estadisticas_kpi,
    datos_serie_mensual,
    datos_pilares_sdca,
    datos_top_procesos,
    datos_pastel_area,
    lista_deudores,
  } = estadisticas;

  return (
    <div className="space-y-6 pb-10">
      <UsabilidadHeaderBanner
        conteo_registros_personalizados={conteo_registros_personalizados}
        on_importar_archivo_excel={importar_archivo_excel}
        on_limpiar_importados={limpiar_registros_importados}
      />
      <UsabilidadFiltrosBar
        texto_busqueda={texto_busqueda}
        on_cambiar_busqueda={set_texto_busqueda}
        anio_seleccionado={anio_seleccionado}
        on_cambiar_anio={set_anio_seleccionado}
        mes_seleccionado={mes_seleccionado}
        on_cambiar_mes={set_mes_seleccionado}
        area_seleccionada={area_seleccionada}
        on_cambiar_area={set_area_seleccionada}
        herramienta_seleccionada={herramienta_seleccionada}
        on_cambiar_herramienta={set_herramienta_seleccionada}
        anios_disponibles={anios_disponibles}
        areas_disponibles={areas_disponibles}
        incluir_documentos_plataforma={incluir_documentos_plataforma}
        on_cambiar_incluir_plataforma={set_incluir_documentos_plataforma}
        conteo_registros_plataforma={conteo_registros_plataforma}
      />
      <UsabilidadKpiCards
        estadisticas_kpi={estadisticas_kpi}
        cargando_excel_base={cargando_excel_base}
      />

      <Tabs defaultValue="graficos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 bg-muted/70 p-1">
          <TabsTrigger value="graficos" className="py-2 font-semibold">
            <BarChart3 className="size-4 mr-2" /> 1. Análisis de Usabilidad y Ciclo SDCA
          </TabsTrigger>
          <TabsTrigger value="deudores" className="py-2 font-semibold">
            <Users className="size-4 mr-2" /> 2. Deudores y Ranking por Responsable (
            {lista_deudores.length})
          </TabsTrigger>
          <TabsTrigger value="calidad5w" className="py-2 font-semibold">
            <ClipboardCheck className="size-4 mr-2" /> 3. Auditoría de Calidad 5W / IAL (7 Criterios)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="graficos">
          <TabGraficosUsabilidad
            datos_serie_mensual={datos_serie_mensual}
            datos_pilares_sdca={datos_pilares_sdca}
            datos_top_procesos={datos_top_procesos}
            datos_pastel_area={datos_pastel_area}
          />
        </TabsContent>
        <TabsContent value="deudores">
          <TabDeudoresTable lista_deudores={lista_deudores} />
        </TabsContent>
        <TabsContent value="calidad5w">
          <TabAuditoria5WTable
            registros_filtrados={registros_filtrados}
            on_abrir_modal_rubrica={abrir_modal_rubrica}
          />
        </TabsContent>
      </Tabs>

      <ModalEvaluarRubrica5W
        registro_en_evaluacion={registro_en_evaluacion}
        borrador_rubrica={borrador_rubrica}
        on_cambiar_borrador={set_borrador_rubrica}
        on_cerrar_modal={() => set_registro_en_evaluacion(null)}
        on_guardar_rubrica={guardar_evaluacion_rubrica}
      />
    </div>
  );
}
