import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SubfaseIdentificacionProblema } from "./plan-subfase-identificacion";
import { SubfaseAnalisis } from "./plan-subfase-analisis";
import type { PropiedadesFasePlan } from "./plan-props";

export type { PropiedadesFasePlan };

/**
 * Componente Principal de la Fase PLAN (Pasos 1 al 18)
 * Modularizado y dividido en subfases:
 * - Subfase 1: Identificación del Problema (Pasos 1-7)
 * - Subfase 2: Análisis de Causa Raíz (Pasos 8-18)
 */
export const PdcaPhasePlan: React.FC<PropiedadesFasePlan> = (props) => {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        {/* Subfase 1: Identificación del Problema */}
        <AccordionItem
          value="subfase-1"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 1: Identificación del Problema (Pasos 1-7)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">
            <SubfaseIdentificacionProblema {...props} />
          </AccordionContent>
        </AccordionItem>

        {/* Subfase 2: Análisis */}
        <AccordionItem
          value="subfase-2"
          className="border rounded-md bg-white shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 2: Análisis (Pasos 8-18)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">
            <SubfaseAnalisis {...props} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
