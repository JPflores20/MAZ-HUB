/**
 * usabilidad-htas.tsx
 * Orquestador modular de la ruta "/usabilidad-htas": Análisis de Uso de Herramientas de Gestión
 * (5Ws, RDAs, PDCAs), Ciclo SDCA, Control de Deudores y Auditoría de Calidad 5W (7 criterios IAL).
 */
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, ClipboardCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModalEvaluarRubrica5W } from "@/components/usabilidad/modal_evaluar_rubrica_5w";
import { TabAuditoria5WTable } from "@/components/usabilidad/tab_auditoria_5w_table";
import { TabDeudoresTable } from "@/components/usabilidad/tab_deudores_table";
import { TabGraficosUsabilidad } from "@/components/usabilidad/tab_graficos_usabilidad";
import { UsabilidadFiltrosBar } from "@/components/usabilidad/usabilidad_filtros_bar";
import { UsabilidadHeaderBanner } from "@/components/usabilidad/usabilidad_header_banner";
import { UsabilidadKpiCards } from "@/components/usabilidad/usabilidad_kpi_cards";
import { useAuth } from "@/auth/auth-context";
import { normalizar_calificacion_porcentaje } from "@/data/usabilidad/usabilidad_calculators";
import type { RegistroAnalisis5WRda, RubricaCalidad5W } from "@/data/usabilidad/usabilidad_types";
import { use_estadisticas_usabilidad } from "@/hooks/usabilidad/use_estadisticas_usabilidad";
import { use_usabilidad_data } from "@/hooks/usabilidad/use_usabilidad_data";

export const Route = createFileRoute("/usabilidad-htas")({
  head: () => ({
    meta: [
      { title: "Usabilidad de Herramientas (5Ws y RDAs) · MAZ HUB" },
      { name: "description", content: "Análisis de Uso de Herramientas de Gestión (5Ws, RDAs, PDCAs), Ciclo SDCA, Deudores y Evaluación de Calidad IAL." },
    ],
  }),
  component: PaginaUsabilidadHerramientas,
});

function PaginaUsabilidadHerramientas() {
  const { currentUser: usuario_actual } = useAuth();
  const {
    todos_los_registros,
    conteo_registros_personalizados,
    conteo_registros_plataforma,
    cargando_excel_base,
    incluir_documentos_plataforma,
    set_incluir_documentos_plataforma,
    importar_archivo_excel,
    actualizar_rubrica_registro,
    limpiar_registros_importados,
  } = use_usabilidad_data();

  const [anio_seleccionado, set_anio_seleccionado] = useState("ALL");
  const [mes_seleccionado, set_mes_seleccionado] = useState("ALL");
  const [area_seleccionada, set_area_seleccionada] = useState("ALL");
  const [herramienta_seleccionada, set_herramienta_seleccionada] = useState("ALL");
  const [texto_busqueda, set_texto_busqueda] = useState("");
  const [registro_en_evaluacion, set_registro_en_evaluacion] = useState<RegistroAnalisis5WRda | null>(null);
  const [borrador_rubrica, set_borrador_rubrica] = useState<RubricaCalidad5W>({
    informacion_completa: true,
    flujo_cumplido: true,
    primera_linea_involucrada: true,
    evidencia_por_ques: true,
    secuencia_logica: true,
    causa_raiz_encontrada: true,
    acciones_cierre_ciclo: true,
    comentarios_mejora: "",
    evaluado_por: usuario_actual?.name || "",
  });

  const anios_disponibles = useMemo(() => {
    const anios = new Set<number>();
    todos_los_registros.forEach((r) => { if (r.anio_evento) anios.add(r.anio_evento); });
    return Array.from(anios).sort((a, b) => b - a);
  }, [todos_los_registros]);

  const areas_disponibles = useMemo(() => {
    const areas = new Set<string>();
    todos_los_registros.forEach((r) => {
      if (r.area_operativa && r.area_operativa !== "(VACÍO)") areas.add(r.area_operativa);
    });
    return Array.from(areas).sort();
  }, [todos_los_registros]);

  const registros_filtrados = useMemo(() => {
    const consulta = texto_busqueda.trim().toLowerCase();
    return todos_los_registros.filter((r) => {
      if (anio_seleccionado !== "ALL" && String(r.anio_evento) !== anio_seleccionado) return false;
      if (mes_seleccionado !== "ALL" && String(r.mes_evento) !== mes_seleccionado) return false;
      if (area_seleccionada !== "ALL" && r.area_operativa !== area_seleccionada) return false;
      if (herramienta_seleccionada !== "ALL" && r.tipo_herramienta !== herramienta_seleccionada) return false;
      if (!consulta) return true;
      return (
        r.descripcion_falla.toLowerCase().includes(consulta) ||
        r.nombre_responsable.toLowerCase().includes(consulta) ||
        r.proceso_cervecero.toLowerCase().includes(consulta) ||
        r.equipo_afectado.toLowerCase().includes(consulta) ||
        r.id_ial.toLowerCase().includes(consulta)
      );
    });
  }, [todos_los_registros, anio_seleccionado, mes_seleccionado, area_seleccionada, herramienta_seleccionada, texto_busqueda]);

  const {
    estadisticas_kpi,
    datos_serie_mensual,
    datos_pilares_sdca,
    datos_top_procesos,
    datos_pastel_area,
    lista_deudores,
  } = use_estadisticas_usabilidad(registros_filtrados);

  const abrir_modal_rubrica = (registro: RegistroAnalisis5WRda) => {
    set_registro_en_evaluacion(registro);
    if (registro.rubrica_5w) {
      set_borrador_rubrica({ ...registro.rubrica_5w, evaluado_por: registro.rubrica_5w.evaluado_por || usuario_actual?.name || "" });
      return;
    }
    const pct = normalizar_calificacion_porcentaje(registro.calificacion_ial);
    const aprobado = pct === null ? true : pct >= 70;
    set_borrador_rubrica({
      informacion_completa: aprobado,
      flujo_cumplido: aprobado,
      primera_linea_involucrada: aprobado,
      evidencia_por_ques: aprobado,
      secuencia_logica: aprobado,
      causa_raiz_encontrada: aprobado,
      acciones_cierre_ciclo: aprobado,
      comentarios_mejora: "",
      evaluado_por: usuario_actual?.name || "",
    });
  };

  const guardar_evaluacion_rubrica = () => {
    if (!registro_en_evaluacion) return;
    actualizar_rubrica_registro(registro_en_evaluacion.id, borrador_rubrica);
    set_registro_en_evaluacion(null);
  };

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
      <UsabilidadKpiCards estadisticas_kpi={estadisticas_kpi} cargando_excel_base={cargando_excel_base} />

      <Tabs defaultValue="graficos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 bg-muted/70 p-1">
          <TabsTrigger value="graficos" className="py-2 font-semibold">
            <BarChart3 className="size-4 mr-2" /> 1. Análisis de Usabilidad y Ciclo SDCA
          </TabsTrigger>
          <TabsTrigger value="deudores" className="py-2 font-semibold">
            <Users className="size-4 mr-2" /> 2. Deudores y Ranking por Responsable ({lista_deudores.length})
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
          <TabAuditoria5WTable registros_filtrados={registros_filtrados} on_abrir_modal_rubrica={abrir_modal_rubrica} />
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
