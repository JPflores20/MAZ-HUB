/**
 * subphase_2.tsx
 * Vista modular de la segunda subfase de planificación (Análisis de Causa Raíz).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageUploadSection } from "../../image-upload-section";
import { ColeccionDatosTable } from "../paso9/coleccion-datos-table";
import { ParetoSection } from "@/components/pdca/1.PLAN/paso10/pareto-section";
import { FlavorCorrelationSection } from "../paso11/flavor-correlation-section";
import { RendimientoActualStep } from "../paso14/rendimiento-actual-step";
import { GopThemesSection } from "../paso15/GopThemesSection";
import { IshikawaSection } from "../paso16/ishikawa-section";
import { FiveWhysSection } from "../paso17/five-whys-section";
import { ConclusionesCausaRaizTable } from "../paso18/conclusiones-causa-raiz-table";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PhasePlanProps } from "./phase_plan_types";

/**
 * Subfase 2 component: Contains steps 8 to 18 for PDCA Plan Phase.
 */
export const Subphase2: React.FC<PhasePlanProps> = ({
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
  is_admin_user,
  is_editable = true,
  baseline_image,
  on_baseline_image_change,
  coleccion_datos,
  on_coleccion_datos_change,
  pareto_drill_downs,
  on_pareto_drill_downs_change,
  pareto_data_map,
  on_pareto_data_map_change,
  pareto_unit,
  on_pareto_unit_change,
  pareto_titles,
  on_pareto_titles_change,
  has_flavor_correlation,
  set_has_flavor_correlation,
  flavor_correlation_data,
  on_flavor_correlation_data_change,
  on_force_save,
  especificacion_procesos_image,
  on_especificacion_procesos_image_change,
  benchmark_image,
  on_benchmark_image_change,
  rendimiento_actual_pis,
  on_rendimiento_actual_pis_change,
  rendimiento_actual_image,
  on_rendimiento_actual_image_change,
  gop_themes_data,
  on_gop_themes_data_change,
  ishikawas,
  on_ishikawas_change,
  five_whys_tables,
  on_five_whys_tables_change,
  conclusiones_causa_raiz,
  on_conclusiones_causa_raiz_change,
  on_send_root_causes_to_action_plan,
}) => {
  const { t } = useTranslation();
  const can_edit_correlation = is_admin_user || is_editable !== false;

  const manejarEnvioIshikawaA5Porques = (causasPriorizadasTexto: string[]) => {
    if (!on_five_whys_tables_change) return;
    const tablasActuales = Array.isArray(five_whys_tables) ? [...five_whys_tables] : [];
    const primeraTabla = tablasActuales[0] ?? {
      id: `fivewhys-${Date.now()}`,
      title: "CAUSAS PRIORIZADAS ISHIKAWA",
      rows: [],
    };
    const filasExistentes = (
      Array.isArray(primeraTabla.rows)
        ? primeraTabla.rows
        : Object.values(primeraTabla.rows || {})
    ) as any[];

    // Filtrar filas completamente vacías iniciales
    const filasConContenido = filasExistentes.filter(
      (f) => String(f?.q1 || "").trim() !== "" || String(f?.w1 || "").trim() !== "",
    );

    const nuevasFilas = [...filasConContenido];
    let agregadas = 0;

    causasPriorizadasTexto.forEach((textoCausa, idx) => {
      const yaExiste = nuevasFilas.some(
        (f) => String(f?.q1 || "").trim().toLowerCase() === textoCausa.toLowerCase(),
      );
      if (!yaExiste) {
        nuevasFilas.push({
          id: Date.now() + idx + Math.random(),
          q1: textoCausa,
          q2: "",
          q3: "",
          q4: "",
          q5: "",
          w1: "",
          w2: "",
          w3: "",
          w4: "",
          w5: "",
          accion: "",
        });
        agregadas++;
      }
    });

    if (agregadas === 0) {
      toast.info("Las causas seleccionadas ya se encuentran en la tabla de 5 Porqués.");
      return;
    }

    const tablaActualizada = { ...primeraTabla, rows: nuevasFilas };
    on_five_whys_tables_change(
      tablasActuales.length > 0
        ? [tablaActualizada, ...tablasActuales.slice(1)]
        : [tablaActualizada],
    );
    toast.success(`Se enviaron ${agregadas} causa(s) priorizada(s) al Paso 17 (5 Why's).`);
  };

  const manejarEnvio5PorquesAConclusiones = (
    hallazgos: { problema: string; causaRaiz: string; accion: string }[],
  ) => {
    if (!on_conclusiones_causa_raiz_change) return;
    const actuales = Array.isArray(conclusiones_causa_raiz) ? [...conclusiones_causa_raiz] : [];
    let agregadas = 0;

    hallazgos.forEach((h) => {
      const yaExiste = actuales.some(
        (item) =>
          String(item?.causaRaiz || "").trim().toLowerCase() === h.causaRaiz.toLowerCase() &&
          String(item?.problema || "").trim().toLowerCase() === h.problema.toLowerCase(),
      );
      if (!yaExiste) {
        actuales.push({
          id: crypto.randomUUID(),
          problema: h.problema,
          causaRaiz: h.causaRaiz,
          validacion: "Análisis 5 Porqués",
          valorP: "Validada",
          conclusion: h.accion || "Causa raíz confirmada para Plan de Acción",
        });
        agregadas++;
      }
    });

    if (agregadas === 0) {
      toast.info("Estas causas raíz ya fueron agregadas al Paso 18.");
      return;
    }

    on_conclusiones_causa_raiz_change(actuales);
    toast.success(`Se enviaron ${agregadas} causa(s) raíz al Paso 18.`);
  };

  return (
    <div className="space-y-6">
      {/* PASO 8: Línea base */}
      <ImageUploadSection
        image={baseline_image || null}
        onChange={(img) => on_baseline_image_change?.(img || undefined)}
        title={t("pdcaPlan.step8Title")}
        subtitle={t("pdcaPlan.step8Subtitle")}
        isStepCompleted={completed_steps.has("step-7")}
        onToggleStep={() => on_toggle_step("step-7")}
        isNa={na_steps?.has("step-7")}
        onToggleNa={() => on_toggle_na?.("step-7")}
      />

      {/* PASO 9: Data collection Plan */}
      <ColeccionDatosTable
        items={coleccion_datos || []}
        onChange={(d) => on_coleccion_datos_change?.(d)}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
        isNa={na_steps?.has("step-8")}
        onToggleNa={() => on_toggle_na?.("step-8")}
      />

      {/* PASO 10: Pareto */}
      <ParetoSection
        drillDowns={pareto_drill_downs || []}
        setDrillDowns={on_pareto_drill_downs_change!}
        dataMap={pareto_data_map || {}}
        setDataMap={on_pareto_data_map_change!}
        unit={pareto_unit || ""}
        onUnitChange={on_pareto_unit_change!}
        paretoTitles={pareto_titles}
        onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
        isNa={na_steps?.has("step-9")}
        onToggleNa={() => on_toggle_na?.("step-9")}
      />

      {/* Correlaciones (Análisis de Flavors) */}
      <div className="pt-2">
        {has_flavor_correlation ? (
          <div className="pt-4 border-t border-border/40 mt-4">
            <FlavorCorrelationSection
              onForceSave={on_force_save}
              data={flavor_correlation_data}
              onChange={on_flavor_correlation_data_change}
              title={t("pdcaPlan.step11Title")}
              isStepCompleted={completed_steps.has("step-flavor")}
              onToggleStep={() => on_toggle_step("step-flavor")}
              isNa={na_steps?.has("step-flavor")}
              onToggleNa={() => on_toggle_na?.("step-flavor")}
              removeNode={
                can_edit_correlation ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-4 mr-2" /> {t("pdcaPlan.removeAnalysis")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("pdcaPlan.removeCorrelationAnalysis")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("pdcaPlan.removeCorrelationDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => set_has_flavor_correlation?.(false)}
                        >
                          {t("pdcaPlan.yesRemove")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null
              }
            />
          </div>
        ) : (
          can_edit_correlation && (
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                onClick={() => set_has_flavor_correlation?.(true)}
                variant="outline"
                className="gap-2 shadow-sm bg-card hover:bg-card/80"
              >
                <Plus className="size-4" /> {t("pdcaPlan.addFlavorAnalysis")}
              </Button>
            </div>
          )
        )}
      </div>

      {/* PASO 12: Especificaciones del Proceso */}
      <ImageUploadSection
        image={especificacion_procesos_image || null}
        onChange={(img) => on_especificacion_procesos_image_change?.(img || undefined)}
        title={t("pdcaPlan.step12Title")}
        subtitle={t("pdcaPlan.step12Subtitle")}
        isStepCompleted={completed_steps.has("step-10")}
        onToggleStep={() => on_toggle_step("step-10")}
        isNa={na_steps?.has("step-10")}
        onToggleNa={() => on_toggle_na?.("step-10")}
      />

      {/* PASO 13: PUNTO DE REFERENCIA */}
      <ImageUploadSection
        image={benchmark_image || null}
        onChange={(img) => on_benchmark_image_change?.(img || undefined)}
        title={t("pdcaPlan.step13Title")}
        subtitle={t("pdcaPlan.step13Subtitle")}
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
        isNa={na_steps?.has("step-11")}
        onToggleNa={() => on_toggle_na?.("step-11")}
      />

      {/* PASO 14: Rendimiento Actual del Proceso */}
      <RendimientoActualStep
        items={rendimiento_actual_pis || []}
        onChange={on_rendimiento_actual_pis_change!}
        image={rendimiento_actual_image}
        onImageChange={on_rendimiento_actual_image_change!}
        isStepCompleted={completed_steps.has("step-13")}
        onToggleStep={() => on_toggle_step("step-13")}
        isNa={na_steps?.has("step-13")}
        onToggleNa={() => on_toggle_na?.("step-13")}
      />

      {/* PASO 15: GOP Themes */}
      <GopThemesSection
        data={gop_themes_data || []}
        onChange={on_gop_themes_data_change!}
        isStepCompleted={completed_steps.has("step-gops")}
        onToggleStep={() => on_toggle_step("step-gops")}
        isNa={na_steps?.has("step-gops")}
        onToggleNa={() => on_toggle_na?.("step-gops")}
      />

      {/* PASO 16: Fishbone */}
      <IshikawaSection
        ishikawas={ishikawas || []}
        onChange={on_ishikawas_change!}
        onSendToFiveWhys={manejarEnvioIshikawaA5Porques}
        isStepCompleted={completed_steps.has("step-14")}
        onToggleStep={() => on_toggle_step("step-14")}
        isNa={na_steps?.has("step-14")}
        onToggleNa={() => on_toggle_na?.("step-14")}
      />

      {/* PASO 17: 5 Why's */}
      <FiveWhysSection
        tables={five_whys_tables || []}
        onChange={on_five_whys_tables_change!}
        onSendToConclusions={manejarEnvio5PorquesAConclusiones}
        isStepCompleted={completed_steps.has("step-15")}
        onToggleStep={() => on_toggle_step("step-15")}
        isNa={na_steps?.has("step-15")}
        onToggleNa={() => on_toggle_na?.("step-15")}
      />

      {/* PASO 18: Causas Raíz Definidas */}
      <ConclusionesCausaRaizTable
        title={t("pdcaPlan.step18Title")}
        items={conclusiones_causa_raiz || []}
        onChange={on_conclusiones_causa_raiz_change!}
        onSendToActionPlan={on_send_root_causes_to_action_plan}
        isStepCompleted={completed_steps.has("step-17")}
        onToggleStep={() => on_toggle_step("step-17")}
        isNa={na_steps?.has("step-17")}
        onToggleNa={() => on_toggle_na?.("step-17")}
      />
    </div>
  );
};
