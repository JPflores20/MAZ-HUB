/**
 * @fileoverview Acordeón informativo con instrucciones metodológicas para cada paso del PDCA.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

interface PropiedadesInstruccionesPaso {
  title?: string;
  children: React.ReactNode;
}

/**
 * Muestra un banner desplegable con la guía metodológica correspondiente al paso.
 */
export function StepInstructions({ title, children }: PropiedadesInstruccionesPaso) {
  const { t: translate } = useTranslation();
  const titulo_mostrado = title || translate("pdcaGlobal.instrucciones");

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-4 border rounded-md bg-secondary/30 px-4"
    >
      <AccordionItem value="instructions" className="border-none">
        <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs">
              i
            </span>
            {titulo_mostrado}
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-xs leading-relaxed pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
