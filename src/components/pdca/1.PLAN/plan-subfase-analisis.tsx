import { Plus, X } from "lucide-react";
import { ImageUploadSection } from "../image-upload-section";
import { ParetoSection } from "@/components/pdca/1.PLAN/paso10/pareto-section";
import { IshikawaSection } from "./paso16/ishikawa-section";
import { FiveWhysSection } from "./paso17/five-whys-section";
import { FlavorCorrelationSection } from "./paso11/flavor-correlation-section";
import { GopThemesSection } from "./paso15/GopThemesSection";
import { ColeccionDatosTable } from "./paso9/coleccion-datos-table";
import { RendimientoActualStep } from "./paso14/rendimiento-actual-step";
import { ConclusionesCausaRaizTable } from "./paso18/conclusiones-causa-raiz-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { PropiedadesFasePlan } from "./plan-props";

type PropiedadesSubfaseAnalisis = Pick<PropiedadesFasePlan,
  | "completed_steps" | "na_steps" | "on_toggle_step" | "on_toggle_na"
  | "is_admin_user" | "is_editable"
  | "baseline_image" | "on_baseline_image_change"
  | "coleccion_datos" | "on_coleccion_datos_change"
  | "pareto_drill_downs" | "on_pareto_drill_downs_change"
  | "pareto_data_map" | "on_pareto_data_map_change"
  | "pareto_unit" | "on_pareto_unit_change"
  | "pareto_titles" | "on_pareto_titles_change"
  | "has_flavor_correlation" | "set_has_flavor_correlation"
  | "flavor_correlation_data" | "on_flavor_correlation_data_change" | "on_force_save"
  | "especificacion_procesos_image" | "on_especificacion_procesos_image_change"
  | "benchmark_image" | "on_benchmark_image_change"
  | "rendimiento_actual_pis" | "on_rendimiento_actual_pis_change"
  | "rendimiento_actual_image" | "on_rendimiento_actual_image_change"
  | "gop_themes_data" | "on_gop_themes_data_change"
  | "ishikawas" | "on_ishikawas_change"
  | "five_whys_tables" | "on_five_whys_tables_change"
  | "conclusiones_causa_raiz" | "on_conclusiones_causa_raiz_change"
>;

/** Subfase 2: Análisis (Pasos 8-18) */
export function SubfaseAnalisis(props: PropiedadesSubfaseAnalisis) {
  const {
    completed_steps, na_steps, on_toggle_step, on_toggle_na, is_admin_user,
    baseline_image, on_baseline_image_change, coleccion_datos, on_coleccion_datos_change,
    pareto_drill_downs, on_pareto_drill_downs_change, pareto_data_map, on_pareto_data_map_change,
    pareto_unit, on_pareto_unit_change, pareto_titles, on_pareto_titles_change,
    has_flavor_correlation, set_has_flavor_correlation, flavor_correlation_data,
    on_flavor_correlation_data_change, on_force_save, especificacion_procesos_image,
    on_especificacion_procesos_image_change, benchmark_image, on_benchmark_image_change,
    rendimiento_actual_pis, on_rendimiento_actual_pis_change, rendimiento_actual_image,
    on_rendimiento_actual_image_change, gop_themes_data, on_gop_themes_data_change,
    ishikawas, on_ishikawas_change, five_whys_tables, on_five_whys_tables_change,
    conclusiones_causa_raiz, on_conclusiones_causa_raiz_change,
  } = props;

  return (
    <>
      {/* PASO 8: LÍNEA BASE */}
      <ImageUploadSection image={baseline_image || null}
        onChange={(img) => on_baseline_image_change?.(img || undefined)}
        title="PASO 8: LÍNEA BASE" subtitle="Sube una imagen representativa del baseline"
        isStepCompleted={completed_steps.has("step-7")} onToggleStep={() => on_toggle_step("step-7")}
        isNa={na_steps?.has("step-7")} onToggleNa={() => on_toggle_na?.("step-7")} />

      {/* PASO 9: DATA COLLECTION PLAN */}
      <ColeccionDatosTable items={coleccion_datos || []}
        onChange={(d) => on_coleccion_datos_change?.(d)}
        isStepCompleted={completed_steps.has("step-8")} onToggleStep={() => on_toggle_step("step-8")}
        isNa={na_steps?.has("step-8")} onToggleNa={() => on_toggle_na?.("step-8")} />

      {/* PASO 10: PARETO */}
      <ParetoSection drillDowns={pareto_drill_downs || []} setDrillDowns={on_pareto_drill_downs_change!}
        dataMap={pareto_data_map || {}} setDataMap={on_pareto_data_map_change!}
        unit={pareto_unit || ""} onUnitChange={on_pareto_unit_change!}
        paretoTitles={pareto_titles ?? {}} onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-9")} onToggleStep={() => on_toggle_step("step-9")}
        isNa={na_steps?.has("step-9")} onToggleNa={() => on_toggle_na?.("step-9")} />

      {/* PASO 11: CORRELACIÓN DE FLAVORS (opcional) */}
      <div className="pt-2">
        {has_flavor_correlation ? (
          <div className="pt-4 border-t border-border/40 mt-4">
            <FlavorCorrelationSection onForceSave={on_force_save} data={flavor_correlation_data}
              onChange={on_flavor_correlation_data_change}
              title="PASO 11: CORRELACIÓN"
              isStepCompleted={completed_steps.has("step-flavor")} onToggleStep={() => on_toggle_step("step-flavor")}
              isNa={na_steps?.has("step-flavor")} onToggleNa={() => on_toggle_na?.("step-flavor")}
              removeNode={
                is_admin_user ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <X className="size-4 mr-2" /> Quitar Análisis
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Quitar Análisis de Correlación?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción ocultará la sección de correlación de flavors.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => set_has_flavor_correlation?.(false)}>Sí, quitar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null
              }
            />
          </div>
        ) : (
          is_admin_user && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => set_has_flavor_correlation?.(true)} variant="outline" className="gap-2 shadow-sm bg-card hover:bg-card/80">
                <Plus className="size-4" /> Agregar Análisis de Flavors (Correlaciones)
              </Button>
            </div>
          )
        )}
      </div>

      {/* PASO 12: ESPECIFICACIONES DEL PROCESO */}
      <ImageUploadSection image={especificacion_procesos_image || null}
        onChange={(img) => on_especificacion_procesos_image_change?.(img || undefined)}
        title="PASO 12: ESPECIFICACIONES DEL PROCESO" subtitle="Sube una imagen con las especificaciones"
        isStepCompleted={completed_steps.has("step-10")} onToggleStep={() => on_toggle_step("step-10")}
        isNa={na_steps?.has("step-10")} onToggleNa={() => on_toggle_na?.("step-10")} />

      {/* PASO 13: PUNTO DE REFERENCIA */}
      <ImageUploadSection image={benchmark_image || null}
        onChange={(img) => on_benchmark_image_change?.(img || undefined)}
        title="PASO 13: PUNTO DE REFERENCIA" subtitle="Sube una imagen representativa del Punto de Referencia"
        isStepCompleted={completed_steps.has("step-11")} onToggleStep={() => on_toggle_step("step-11")}
        isNa={na_steps?.has("step-11")} onToggleNa={() => on_toggle_na?.("step-11")} />

      {/* PASO 14: RENDIMIENTO ACTUAL DEL PROCESO */}
      <RendimientoActualStep items={rendimiento_actual_pis || []} onChange={on_rendimiento_actual_pis_change!}
        image={rendimiento_actual_image} onImageChange={on_rendimiento_actual_image_change!}
        isStepCompleted={completed_steps.has("step-13")} onToggleStep={() => on_toggle_step("step-13")}
        isNa={na_steps?.has("step-13")} onToggleNa={() => on_toggle_na?.("step-13")} />

      {/* PASO 15: GOP THEMES */}
      <GopThemesSection data={gop_themes_data || []} onChange={on_gop_themes_data_change!}
        isStepCompleted={completed_steps.has("step-gops")} onToggleStep={() => on_toggle_step("step-gops")}
        isNa={na_steps?.has("step-gops")} onToggleNa={() => on_toggle_na?.("step-gops")} />

      {/* PASO 16: FISHBONE (ISHIKAWA) */}
      <IshikawaSection ishikawas={ishikawas || []} onChange={on_ishikawas_change!}
        isStepCompleted={completed_steps.has("step-14")} onToggleStep={() => on_toggle_step("step-14")}
        isNa={na_steps?.has("step-14")} onToggleNa={() => on_toggle_na?.("step-14")} />

      {/* PASO 17: 5 WHY'S */}
      <FiveWhysSection tables={five_whys_tables || []} onChange={on_five_whys_tables_change!}
        isStepCompleted={completed_steps.has("step-15")} onToggleStep={() => on_toggle_step("step-15")}
        isNa={na_steps?.has("step-15")} onToggleNa={() => on_toggle_na?.("step-15")} />

      {/* PASO 18: CAUSAS RAÍZ DEFINIDAS */}
      <ConclusionesCausaRaizTable title="PASO 18: CAUSAS RAÍZ DEFINIDAS"
        items={conclusiones_causa_raiz || []} onChange={on_conclusiones_causa_raiz_change!}
        isStepCompleted={completed_steps.has("step-17")} onToggleStep={() => on_toggle_step("step-17")}
        isNa={na_steps?.has("step-17")} onToggleNa={() => on_toggle_na?.("step-17")} />
    </>
  );
}
