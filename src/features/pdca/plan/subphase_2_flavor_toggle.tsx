/**
 * @fileoverview Bloque condicional con confirmación de borrado para el análisis opcional de Correlación de Sabores.
 */
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
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
} from "@/shared/ui/alert_dialog";
import { FlavorCorrelationSection } from "./paso_11_flavor_correlation/flavor_correlation_section";
import type { DatosCorrelacionSabor } from "./paso_11_flavor_correlation/flavor_correlation_utils";

interface PropiedadesSeccionOpcionalCorrelacion {
  has_flavor_correlation?: boolean | undefined;
  set_has_flavor_correlation?: ((habilitado: boolean) => void) | undefined;
  flavor_correlation_data?: DatosCorrelacionSabor | null | undefined;
  on_flavor_correlation_data_change?: ((datos: DatosCorrelacionSabor) => void) | undefined;
  on_force_save?: (() => void) | undefined;
  can_edit_correlation: boolean;
  is_step_completed: boolean;
  is_na: boolean | undefined;
  on_toggle_step: () => void;
  on_toggle_na: () => void;
}

/**
 * Permite habilitar o quitar el paso opcional de análisis de correlación sensorial (Step 11).
 */
export function Subphase2FlavorToggle({
  has_flavor_correlation,
  set_has_flavor_correlation,
  flavor_correlation_data,
  on_flavor_correlation_data_change,
  on_force_save,
  can_edit_correlation,
  is_step_completed,
  is_na,
  on_toggle_step,
  on_toggle_na,
}: PropiedadesSeccionOpcionalCorrelacion) {
  const { t: translate } = useTranslation();

  if (!has_flavor_correlation) {
    if (!can_edit_correlation) return null;
    return (
      <div className="pt-2">
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={() => set_has_flavor_correlation?.(true)}
            variant="outline"
            className="gap-2 shadow-sm bg-card hover:bg-card/80"
          >
            <Plus className="size-4" /> {translate("pdcaPlan.addFlavorAnalysis")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="pt-4 border-t border-border/40 mt-4">
        <FlavorCorrelationSection
          onForceSave={on_force_save}
          data={flavor_correlation_data}
          onChange={on_flavor_correlation_data_change}
          title={translate("pdcaPlan.step11Title")}
          isStepCompleted={is_step_completed}
          onToggleStep={on_toggle_step}
          isNa={is_na}
          onToggleNa={on_toggle_na}
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
                    <X className="size-4 mr-2" /> {translate("pdcaPlan.removeAnalysis")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {translate("pdcaPlan.removeCorrelationAnalysis")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {translate("pdcaPlan.removeCorrelationDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{translate("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => set_has_flavor_correlation?.(false)}
                    >
                      {translate("pdcaPlan.yesRemove")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null
          }
        />
      </div>
    </div>
  );
}
