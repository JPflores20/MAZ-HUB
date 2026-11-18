/**
 * @fileoverview Interactive Ishikawa diagram wrapper inside the Phase 1 Resumen sheet.
 */

import { useTranslation } from "react-i18next";
import { IshikawaInteractivo } from "@/features/pdca/plan/paso_16_ishikawa/ishikawa_interactive";
import type { Rda } from "@/domain/models/rda";
import { get_rda_name, with_rda_name } from "../utils/rda_name";

interface RdaResumenIshikawaBlockProps {
  rda: Rda;
  on_change_rda: ((next_rda: Rda) => void) | undefined;
}

/** Synchronizes Ishikawa causes, effect head title, prioritized items, and labels inside Resumen. */
export function RdaResumenIshikawaBlock({ rda, on_change_rda }: RdaResumenIshikawaBlockProps) {
  const { t } = useTranslation();
  const current_ishikawa = rda.ishikawa?.[0] || { id: "ishikawa-0", effect: "", causes: {} };

  const ensure_diagrams = () =>
    rda.ishikawa?.length
      ? [...rda.ishikawa]
      : [{ id: "ishikawa-0", effect: get_rda_name(rda), causes: {}, customLabels: {} }];

  return (
    <div className="mb-8 border border-black/30 p-2">
      <IshikawaInteractivo
        tituloPersonalizado={t("rdaInternal.causeEffectDiagram")}
        causasRegistradas={current_ishikawa.causes || {}}
        alCambiarCausas={(causes_or_updater) => {
          if (!on_change_rda) return;
          const resolved_causes =
            typeof causes_or_updater === "function"
              ? causes_or_updater(current_ishikawa.causes || {})
              : causes_or_updater;
          const diagrams = ensure_diagrams();
          diagrams[0] = { ...diagrams[0]!, causes: resolved_causes };
          on_change_rda({ ...rda, ishikawa: diagrams });
        }}
        efectoPrincipal={get_rda_name(rda)}
        alCambiarEfecto={(next_name) => {
          if (!on_change_rda) return;
          const diagrams = ensure_diagrams();
          on_change_rda(with_rda_name({ ...rda, ishikawa: diagrams }, next_name));
        }}
        causasPriorizadas={current_ishikawa.prioritizedCauses || []}
        alCambiarCausasPriorizadas={(prioritized_causes) => {
          if (!on_change_rda) return;
          const diagrams = ensure_diagrams();
          diagrams[0] = { ...diagrams[0]!, prioritizedCauses: prioritized_causes };
          on_change_rda({ ...rda, ishikawa: diagrams });
        }}
        etiquetasPersonalizadas={current_ishikawa.customLabels || {}}
        alCambiarEtiquetas={(labels_or_updater) => {
          if (!on_change_rda) return;
          const resolved_labels =
            typeof labels_or_updater === "function"
              ? labels_or_updater(current_ishikawa.customLabels || {})
              : labels_or_updater;
          const diagrams = ensure_diagrams();
          diagrams[0] = { ...diagrams[0]!, customLabels: resolved_labels };
          on_change_rda({ ...rda, ishikawa: diagrams });
        }}
        defaultExpanded={true}
        hidePrioritizationTable={true}
      />
    </div>
  );
}
