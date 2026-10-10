import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PhasePlanProps } from "./components/phase_plan_types";
import { Subphase1 } from "./components/subphase_1";
import { Subphase2 } from "./components/subphase_2";

export type { PhasePlanProps }; // Re-export for any potential consumers

export const PdcaPhasePlan: React.FC<PhasePlanProps> = (props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        {/* Subfase 1 */}
        <AccordionItem
          value="subfase-1"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            {t("pdcaPlan.subphase1Title")}
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50 dark:bg-slate-900">
            <Subphase1 {...props} />
          </AccordionContent>
        </AccordionItem>

        {/* Subfase 2 */}
        <AccordionItem
          value="subfase-2"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            {t("pdcaPlan.subphase2Title")}
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50 dark:bg-slate-900">
            <Subphase2 {...props} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
