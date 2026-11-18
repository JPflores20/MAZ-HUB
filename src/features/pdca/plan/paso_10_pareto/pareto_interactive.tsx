/**
 * @fileoverview Orquestador visual de un diagrama de Pareto individual con tabla, gráfica y vista expandida.
 */
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { StepCard } from "@/shared/ui/step_card";
import { ParetoDataTable } from "./pareto_data_table";
import { ParetoChart } from "./pareto_chart";
import { ParetoHeaderActions } from "./pareto_header_actions";
import { ParetoLevelZeroIntro } from "./pareto_level_intro";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "./pareto_data_utils";
import type { ParetoInteractiveProps } from "./pareto_types";

/**
 * Gestiona un Pareto individual, sus controles de ejes, tabla editable y modal de pantalla completa.
 */
export function ParetoInteractive({
  title = "Análisis de Pareto (PASO 5)",
  subtitle = "Desglosa el KPI para encontrar el 80/20.",
  level = 0,
  pareto_items = [],
  on_items_change,
  on_bar_click,
  on_close,
  unit = "",
  on_unit_change,
  is_step_completed,
  on_toggle_step,
  is_na,
  on_toggle_na,
  defaultExpanded,
  on_add_root,
  chart_title: titulo_externo,
  on_chart_title_change: al_cambiar_titulo_externo,
}: ParetoInteractiveProps) {
  const [importacion_abierta, set_importacion_abierta] = useState(false);
  const [pantalla_completa, set_pantalla_completa] = useState(false);
  const [titulo_local, set_titulo_local] = useState("");
  const [eje_y_min, set_eje_y_min] = useState<number>(0);
  const [eje_y_max, set_eje_y_max] = useState<number | "auto">("auto");

  const titulo_grafico = titulo_externo !== undefined ? titulo_externo : titulo_local;
  const actualizar_titulo_grafico = (nuevo_titulo: string) => {
    if (al_cambiar_titulo_externo) al_cambiar_titulo_externo(nuevo_titulo);
    else set_titulo_local(nuevo_titulo);
  };

  const datos_calculados = compute_pareto_data(pareto_items);
  const gap_total = compute_total_gap(pareto_items);
  const formatear_valor = (valor: unknown) => format_pareto_value(valor, unit);

  const agregar_fila_vacia = () => {
    on_items_change?.([...pareto_items, { id: Date.now(), area: "", gap: 0 }]);
  };

  const actualizar_fila = (
    fila_id: number,
    campo: "area" | "gap",
    valor: string | number,
  ) => {
    on_items_change?.(
      pareto_items.map((registro_pareto) =>
        registro_pareto.id === fila_id ? { ...registro_pareto, [campo]: valor } : registro_pareto,
      ),
    );
  };

  const eliminar_fila = (fila_id: number) => {
    on_items_change?.(pareto_items.filter((registro_pareto) => registro_pareto.id !== fila_id));
  };

  const importar_desde_excel = (texto_crudo: string) => {
    const combinados = parse_excel_paste(texto_crudo, pareto_items);
    if (on_items_change && combinados.length > 0) {
      on_items_change(combinados);
      toast.success("Datos importados y agrupados correctamente");
    }
  };

  const propiedades_grafica = {
    chart_data: datos_calculados,
    chart_title: titulo_grafico,
    on_chart_title_change: actualizar_titulo_grafico,
    y_axis_min: eje_y_min,
    y_axis_max: eje_y_max,
    on_y_axis_min_change: set_eje_y_min,
    on_y_axis_max_change: set_eje_y_max,
    unit,
    format_value: formatear_valor,
  };

  return (
    <StepCard
      className="col-span-full animate-in fade-in zoom-in-95"
      isNa={is_na}
      defaultExpanded={defaultExpanded}
      onToggleNa={on_toggle_na}
      title={
        <>
          {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />} {title}
        </>
      }
      isStepCompleted={level === 0 ? is_step_completed : undefined}
      onToggleStep={level === 0 ? on_toggle_step : undefined}
      headerRight={
        <ParetoHeaderActions
          on_close={on_close}
          on_add_root={on_add_root}
          is_paste_open={importacion_abierta}
          on_paste_open_change={set_importacion_abierta}
          on_import_excel={importar_desde_excel}
          on_add_row={agregar_fila_vacia}
        />
      }
    >
      <p className="text-sm text-muted-foreground ml-[36px] mb-4">
        {subtitle} {on_bar_click && "Haz clic en una barra para desglosarla."}
      </p>

      {level === 0 && <ParetoLevelZeroIntro unit={unit} on_unit_change={on_unit_change} />}

      <div className="grid lg:grid-cols-2 gap-6">
        <ParetoDataTable
          pareto_data={datos_calculados}
          raw_items={pareto_items}
          on_row_update={actualizar_fila}
          on_row_remove={eliminar_fila}
          format_value={formatear_valor}
          total_gap={gap_total}
        />
        {!pantalla_completa && (
          <ParetoChart
            {...propiedades_grafica}
            on_bar_click={on_bar_click}
            on_expand={() => set_pantalla_completa(true)}
          />
        )}
      </div>

      <Dialog open={pantalla_completa} onOpenChange={set_pantalla_completa}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-4 sm:p-6 flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle>{titulo_grafico || title || "Pareto"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full relative pt-4 min-h-0">
            <ParetoChart
              {...propiedades_grafica}
              on_bar_click={(categoria_clic) => {
                on_bar_click?.(categoria_clic);
                set_pantalla_completa(false);
              }}
              is_fullscreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}
