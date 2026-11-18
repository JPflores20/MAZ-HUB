/**
 * @fileoverview Phase 1 One-Pager Executive Summary orchestrator with Presentation Mode and PDF print export.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import type { Rda } from "@/domain/models/rda";
import {
  evaluate_rda_methodology,
  MethodologyValidatorCard,
} from "@/shared/components/methodology_validator";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { useRdas } from "@/shared/context/rda_context";
import { Button } from "@/shared/ui/button";
import { get_rda_name } from "../utils/rda_name";
import { RdaResumenChecklistTable } from "./rda_resumen_checklist_table";
import { RdaResumenClosureAndDisclaimer } from "./rda_resumen_closure_and_disclaimer";
import { RdaResumenContextTable } from "./rda_resumen_context_table";
import { RdaResumenIshikawaBlock } from "./rda_resumen_ishikawa_block";
import { RdaResumenPdaTable } from "./rda_resumen_pda_table";
import { RdaResumenProblemSections } from "./rda_resumen_problem_sections";
import { RdaResumenValidationTable } from "./rda_resumen_validation_table";
import { useRdaResumenActions } from "./use_rda_resumen_actions";

interface RdaPhase1ResumenProps {
  rda: Rda;
  onChange?: (rda: Rda) => void;
}

/** Consolidates all editable RDA fields into a single print-ready executive report sheet. */
export function RdaPhase1Resumen({ rda, onChange }: RdaPhase1ResumenProps) {
  const { t } = useTranslation();
  const { directory: available_users, resolve_user } = useDirectoryUsers();
  const { allRdas: all_rdas } = useRdas();
  const [is_presentation_mode, set_is_presentation_mode] = useState(false);
  const print_ref = useRef<HTMLDivElement>(null);

  const rda_methodology = useMemo(() => evaluate_rda_methodology(rda), [rda]);
  const {
    is_editable,
    responsibles_list,
    handle_context_change,
    toggle_responsible,
    add_custom_responsible,
    handle_problem_desc_change,
    handle_immediate_action_change,
    handle_validation_change,
    handle_add_validation_row,
    handle_import_validation,
    handle_add_pda_row,
    handle_toggle_checklist_item,
  } = useRdaResumenActions(rda, onChange);

  const handle_download_pdf = useReactToPrint({
    contentRef: print_ref,
    documentTitle: `Resumen_RDA_${rda.context?.folio || rda.id}`,
    pageStyle: `
      @page { size: landscape; margin: 8mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `,
  });

  return (
    <div
      className={
        is_presentation_mode
          ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6 sm:p-10 space-y-4"
          : "space-y-4"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        {is_presentation_mode ? (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase text-primary">
              Modo Presentación One-Pager RDA
            </span>
            <h2 className="text-base font-bold text-foreground">
              {get_rda_name(rda) || rda.context?.folio || "RDA"}
            </h2>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set_is_presentation_mode((prev) => !prev)}
            className="gap-2 text-xs font-semibold"
          >
            {is_presentation_mode ? (
              <>
                <Minimize2 className="w-4 h-4" /> Salir de Presentación
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" /> Modo Presentación (One-Pager)
              </>
            )}
          </Button>
          <Button
            onClick={handle_download_pdf}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar One-Pager (PDF)
          </Button>
        </div>
      </div>

      <div className="print:hidden">
        <MethodologyValidatorCard
          title="Semáforo de Consistencia Metodológica RDA (Pre-Auditoría)"
          criteria={rda_methodology.criteria}
          scorePct={rda_methodology.scorePct}
        />
      </div>

      <div
        id="rda-resumen-content"
        ref={print_ref}
        className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-border w-full overflow-x-auto text-black print:p-0 print:border-none print:shadow-none"
      >
        <h1 className="text-xl font-bold tracking-wide uppercase text-center mb-4">
          {t("rda.anomalyReport")}
        </h1>

        <RdaResumenContextTable
          rda={rda}
          all_rdas={all_rdas}
          is_editable={is_editable}
          responsibles_list={responsibles_list}
          available_users={available_users}
          resolve_user={resolve_user}
          on_change_context={handle_context_change}
          on_toggle_responsible={toggle_responsible}
          on_add_custom_responsible={add_custom_responsible}
        />

        <RdaResumenProblemSections
          rda={rda}
          is_editable={is_editable}
          on_change_problem_desc={handle_problem_desc_change}
          on_change_immediate_action={handle_immediate_action_change}
          on_change_rda={onChange}
        />

        <RdaResumenIshikawaBlock rda={rda} on_change_rda={onChange} />

        <RdaResumenValidationTable
          validation_actions={rda.validationActions || []}
          is_editable={is_editable}
          on_change_validation={handle_validation_change}
          on_import_from_ishikawa={handle_import_validation}
          on_add_validation_row={handle_add_validation_row}
        />

        <RdaResumenChecklistTable
          checklist={rda.checklistEstandarizacion || {}}
          is_editable={is_editable}
          on_toggle_item={handle_toggle_checklist_item}
        />

        <RdaResumenPdaTable
          pda_actions={rda.pda || []}
          is_editable={is_editable}
          on_change_pda={(next_pda) => onChange?.({ ...rda, pda: next_pda })}
          on_add_pda_row={handle_add_pda_row}
        />

        <RdaResumenClosureAndDisclaimer
          rda={rda}
          is_editable={is_editable}
          on_change_rda={onChange}
        />
      </div>
    </div>
  );
}
