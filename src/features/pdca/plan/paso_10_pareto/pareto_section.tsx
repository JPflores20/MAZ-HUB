/**
 * @fileoverview Gestor multinivel de diagramas de Pareto (raíces independientes + drill-downs jerárquicos).
 */
import { useState } from "react";
import { ParetoInteractive } from "./pareto_interactive";
import type { ParetoSectionProps, ParetoItem } from "./pareto_types";

function analizar_ruta_desglose(
  ruta_cruda: string,
  indice_respaldo: number,
): { ruta_real: string; nivel_profundidad: number; categoria: string } {
  if (!ruta_cruda.includes("level-")) {
    return {
      ruta_real: `level-${indice_respaldo + 1}-${ruta_cruda}`,
      nivel_profundidad: indice_respaldo + 1,
      categoria: ruta_cruda,
    };
  }
  if (ruta_cruda.includes("-level-")) {
    const partes = ruta_cruda.split("-level-");
    const fragmentos = (partes[1] ?? "").split("-");
    return {
      ruta_real: ruta_cruda,
      nivel_profundidad: parseInt(fragmentos[0] ?? "1", 10),
      categoria: fragmentos.slice(1).join("-"),
    };
  }
  const fragmentos_simples = ruta_cruda.split("-");
  return {
    ruta_real: ruta_cruda,
    nivel_profundidad: parseInt(fragmentos_simples[1] ?? "1", 10),
    categoria: fragmentos_simples.slice(2).join("-"),
  };
}

/**
 * Administra el árbol de Paretos principales y sub-Paretos por nivel, manteniendo sus títulos independientes.
 */
export function ParetoSection({
  drill_downs,
  set_drill_downs,
  data_map,
  set_data_map,
  unit = "",
  on_unit_change,
  pareto_titles: titulos_externos,
  on_pareto_titles_change: al_cambiar_titulos_externos,
  is_step_completed,
  is_na,
  on_toggle_step,
  on_toggle_na,
  main_title = "PASO 10: ESTRATIFICACIÓN DEL PROBLEMA (PARETO)",
  secondary_title_prefix = "PASO 10: PARETO INDEPENDIENTE",
}: ParetoSectionProps) {
  const [titulos_internos, set_titulos_internos] = useState<Record<string, string>>({});
  const mapa_titulos = titulos_externos ?? titulos_internos;

  const llaves_raiz = Object.keys(data_map)
    .filter((llave) => llave === "root" || llave.startsWith("root-"))
    .sort();
  if (llaves_raiz.length === 0) llaves_raiz.push("root");

  const actualizar_titulo_grafica = (ruta: string, nuevo_titulo: string) => {
    const siguiente_mapa = { ...mapa_titulos, [ruta]: nuevo_titulo };
    if (al_cambiar_titulos_externos) al_cambiar_titulos_externos(siguiente_mapa);
    else set_titulos_internos(siguiente_mapa);
  };

  const actualizar_datos = (ruta: string, nuevos_items: ParetoItem[]) => {
    set_data_map({ ...data_map, [ruta]: nuevos_items });
  };

  const normalizar_desgloses_actuales = () => {
    const es_formato_legado =
      drill_downs.length > 0 && !(drill_downs[0] ?? "").includes("level-");
    return es_formato_legado
      ? drill_downs.map((item_nivel, indice) => `level-${indice + 1}-${item_nivel}`)
      : [...drill_downs];
  };

  const manejar_clic_barra = (categoria: string, nivel: number, ruta_padre: string) => {
    if (!categoria) return;
    const desgloses_actuales = normalizar_desgloses_actuales();
    const nueva_ruta =
      ruta_padre === "root"
        ? `level-${nivel + 1}-${categoria}`
        : `${ruta_padre}-level-${nivel + 1}-${categoria}`;
    if (!desgloses_actuales.includes(nueva_ruta)) desgloses_actuales.push(nueva_ruta);
    set_drill_downs(desgloses_actuales);
    if (!data_map[nueva_ruta]) set_data_map({ ...data_map, [nueva_ruta]: [] });
  };

  const manejar_cierre_desglose = (ruta_a_eliminar: string) => {
    const desgloses_actuales = normalizar_desgloses_actuales();
    set_drill_downs(
      desgloses_actuales.filter(
        (ruta) => ruta !== ruta_a_eliminar && !ruta.startsWith(`${ruta_a_eliminar}-`),
      ),
    );
    const mapa_actualizado = { ...data_map };
    Object.keys(mapa_actualizado).forEach((llave) => {
      if (llave === ruta_a_eliminar || llave.startsWith(`${ruta_a_eliminar}-`)) {
        delete mapa_actualizado[llave];
      }
    });
    set_data_map(mapa_actualizado);
  };

  const manejar_cierre_raiz = (llave_raiz: string) => {
    set_drill_downs(drill_downs.filter((ruta) => !ruta.startsWith(`${llave_raiz}-`)));
    const mapa_actualizado = { ...data_map };
    Object.keys(mapa_actualizado).forEach((llave) => {
      if (llave === llave_raiz || llave.startsWith(`${llave_raiz}-`)) {
        delete mapa_actualizado[llave];
      }
    });
    set_data_map(mapa_actualizado);
  };

  const manejar_agregar_raiz = () => {
    const mapa_base = { ...data_map };
    if (llaves_raiz.includes("root") && !("root" in mapa_base)) {
      mapa_base["root"] = [];
    }
    set_data_map({ ...mapa_base, [`root-${Date.now()}`]: [] });
  };

  return (
    <div className="space-y-4">
      {llaves_raiz.map((llave_raiz, indice_raiz) => (
        <ParetoInteractive
          key={llave_raiz}
          title={
            indice_raiz === 0 ? main_title : `${secondary_title_prefix} ${indice_raiz + 1}`
          }
          level={0}
          pareto_items={data_map[llave_raiz] ?? []}
          on_items_change={(items) => actualizar_datos(llave_raiz, items)}
          on_bar_click={(categoria) => manejar_clic_barra(categoria, 0, llave_raiz)}
          unit={unit}
          on_add_root={indice_raiz === 0 ? manejar_agregar_raiz : undefined}
          on_close={indice_raiz > 0 ? () => manejar_cierre_raiz(llave_raiz) : undefined}
          on_unit_change={on_unit_change}
          is_step_completed={indice_raiz === 0 ? is_step_completed : undefined}
          on_toggle_step={indice_raiz === 0 ? on_toggle_step : undefined}
          is_na={indice_raiz === 0 ? is_na : undefined}
          on_toggle_na={indice_raiz === 0 ? on_toggle_na : undefined}
          chart_title={mapa_titulos[llave_raiz] ?? ""}
          on_chart_title_change={(titulo) => actualizar_titulo_grafica(llave_raiz, titulo)}
        />
      ))}
      {drill_downs.map((ruta_desglose, indice_desglose) => {
        const { ruta_real, nivel_profundidad, categoria } = analizar_ruta_desglose(
          ruta_desglose,
          indice_desglose,
        );
        return (
          <ParetoInteractive
            key={ruta_real}
            level={nivel_profundidad}
            title={`Sub-Pareto: ${categoria}`}
            subtitle={`Desglose (Nivel ${nivel_profundidad + 1}) de la categoria ${categoria}.`}
            pareto_items={data_map[ruta_real] ?? []}
            on_items_change={(items) => actualizar_datos(ruta_real, items)}
            on_bar_click={(subcategoria) =>
              manejar_clic_barra(subcategoria, nivel_profundidad, ruta_real)
            }
            on_close={() => manejar_cierre_desglose(ruta_real)}
            unit={unit}
            on_unit_change={on_unit_change}
            chart_title={mapa_titulos[ruta_real] ?? ""}
            on_chart_title_change={(titulo) => actualizar_titulo_grafica(ruta_real, titulo)}
          />
        );
      })}
    </div>
  );
}
