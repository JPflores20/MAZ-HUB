/**
 * @fileoverview Orquestador de la Fase 1 (PLAN) del PDCA organizado en dos acordeones (Identificación y Análisis).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { PhasePlanProps } from "./phase_plan_types";
import { Subphase1 } from "./subphase_1";
import { Subphase2 } from "./subphase_2";

export type { PhasePlanProps };

/**
 * Despliega las subfases 1.1 y 1.2 correspondientes a los pasos 1 al 18 de la metodología PDCA.
 */
export const PdcaPhasePlan: React.FC<PhasePlanProps> = (props) => {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem
          value="subfase-1"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            {translate("pdcaPlan.subphase1Title")}
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50 dark:bg-slate-900">
            <Subphase1 {...props} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="subfase-2"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            {translate("pdcaPlan.subphase2Title")}
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50 dark:bg-slate-900">
            <Subphase2 {...props} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
