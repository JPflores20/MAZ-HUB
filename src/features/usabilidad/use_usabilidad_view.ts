/**
 * @fileoverview Custom hook managing filters, statistics, and 5W quality rubric evaluation state.
 */

import { useMemo, useState } from "react";
import { normalizar_calificacion_porcentaje } from "@/domain/calculators/usabilidad_calculators";
import type {
  RegistroAnalisis5WRda,
  RubricaCalidad5W,
} from "@/domain/models/usabilidad/usabilidad_types";
import { useAuth } from "@/features/auth/auth_context";
import { useEstadisticasUsabilidad } from "@/shared/hooks/usabilidad/use_estadisticas_usabilidad";
import { useUsabilidadData } from "@/shared/hooks/usabilidad/use_usabilidad_data";

/** Encapsulates filtering, computed usability statistics, and rubric dialog handlers. */
export function useUsabilidadView() {
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
  } = useUsabilidadData();

  const [anio_seleccionado, set_anio_seleccionado] = useState("ALL");
  const [mes_seleccionado, set_mes_seleccionado] = useState("ALL");
  const [area_seleccionada, set_area_seleccionada] = useState("ALL");
  const [herramienta_seleccionada, set_herramienta_seleccionada] = useState("ALL");
  const [texto_busqueda, set_texto_busqueda] = useState("");
  const [registro_en_evaluacion, set_registro_en_evaluacion] =
    useState<RegistroAnalisis5WRda | null>(null);
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
    const conjunto_anios = new Set<number>();
    todos_los_registros.forEach((registro) => {
      if (registro.anio_evento) conjunto_anios.add(registro.anio_evento);
    });
    return Array.from(conjunto_anios).sort((anio_a, anio_b) => anio_b - anio_a);
  }, [todos_los_registros]);

  const areas_disponibles = useMemo(() => {
    const conjunto_areas = new Set<string>();
    todos_los_registros.forEach((registro) => {
      if (registro.area_operativa && registro.area_operativa !== "(VACÍO)") {
        conjunto_areas.add(registro.area_operativa);
      }
    });
    return Array.from(conjunto_areas).sort();
  }, [todos_los_registros]);

  const registros_filtrados = useMemo(() => {
    const consulta = texto_busqueda.trim().toLowerCase();
    return todos_los_registros.filter((registro) => {
      if (anio_seleccionado !== "ALL" && String(registro.anio_evento) !== anio_seleccionado) {
        return false;
      }
      if (mes_seleccionado !== "ALL" && String(registro.mes_evento) !== mes_seleccionado) {
        return false;
      }
      if (area_seleccionada !== "ALL" && registro.area_operativa !== area_seleccionada) {
        return false;
      }
      if (
        herramienta_seleccionada !== "ALL" &&
        registro.tipo_herramienta !== herramienta_seleccionada
      ) {
        return false;
      }
      if (!consulta) return true;
      return [
        registro.descripcion_falla,
        registro.nombre_responsable,
        registro.proceso_cervecero,
        registro.equipo_afectado,
        registro.id_ial,
      ].some((campo) => campo.toLowerCase().includes(consulta));
    });
  }, [
    todos_los_registros,
    anio_seleccionado,
    mes_seleccionado,
    area_seleccionada,
    herramienta_seleccionada,
    texto_busqueda,
  ]);

  const estadisticas = useEstadisticasUsabilidad(registros_filtrados);

  const abrir_modal_rubrica = (registro: RegistroAnalisis5WRda) => {
    set_registro_en_evaluacion(registro);
    if (registro.rubrica_5w) {
      set_borrador_rubrica({
        ...registro.rubrica_5w,
        evaluado_por: registro.rubrica_5w.evaluado_por || usuario_actual?.name || "",
      });
      return;
    }
    const porcentaje = normalizar_calificacion_porcentaje(registro.calificacion_ial);
    const aprobado = porcentaje === null ? true : porcentaje >= 70;
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

  return {
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
  };
}
