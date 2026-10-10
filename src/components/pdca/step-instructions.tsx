import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function StepInstructions({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) { const { t } = useTranslation(); const displayTitle = title || t("pdcaGlobal.instrucciones"); 
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
            {displayTitle}
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-xs leading-relaxed pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
