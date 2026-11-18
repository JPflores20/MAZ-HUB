/**
 * @fileoverview Paso 34 consolidado de Conclusiones Ejecutivas (KPIs, PIs y Storyboard).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import type { ConclusionesKpiData, ConclusionesPiItem } from "@/domain/pdca";
import { StepCard } from "@/shared/ui/step_card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { TablaConclusionesKpi } from "./conclusiones_kpi_table";
import { TablaConclusionesPi } from "./conclusiones_pi_table";
import { SeccionStoryboardConclusiones } from "./conclusiones_storyboard";

export interface ConclusionesStepProps {
  isStepCompleted: boolean;
  onToggleStep: () => void;
  isNa?: boolean | undefined;
  onToggleNa?: (() => void) | undefined;
  isEditable: boolean;
  kpiData: ConclusionesKpiData | undefined;
  onKpiDataChange: (datos_kpi: ConclusionesKpiData) => void;
  piItems: ConclusionesPiItem[];
  onPiItemsChange: (nuevos_pis: ConclusionesPiItem[]) => void;
  storyboardHtml?: string | undefined;
  onStoryboardHtmlChange?: ((html: string) => void) | undefined;
  storyboardImage?: string | undefined;
  onStoryboardImageChange?: ((imagen_url?: string) => void) | undefined;
}

const KPI_POR_DEFECTO: ConclusionesKpiData = {
  fechaFinalizacion: "",
  mejoroPi: "",
  mejoroKpi: "",
  kpiName: "",
  kpiDe: "",
  kpiA: "",
  kpiVerdeEs: "Más alto",
  kpiMejora: "",
};

/**
 * Renderiza el resumen de impacto final en KPI/PIs y el editor visual del Storyboard.
 */
export const ConclusionesStep: React.FC<ConclusionesStepProps> = ({
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
  isEditable,
  kpiData,
  onKpiDataChange,
  piItems,
  onPiItemsChange,
  storyboardHtml,
  onStoryboardHtmlChange,
  storyboardImage,
  onStoryboardImageChange,
}) => {
  const { t: translate } = useTranslation();
  const datos_kpi_actuales = kpiData || KPI_POR_DEFECTO;

  const cambiar_campo_kpi = (campo: keyof ConclusionesKpiData, valor: string) => {
    onKpiDataChange({ ...datos_kpi_actuales, [campo]: valor });
  };

  const agregar_pi = () => {
    const nuevo_pi: ConclusionesPiItem = {
      id: crypto.randomUUID(),
      piName: "",
      piDe: "",
      piA: "",
      piVerdeEs: "Más alto",
      piMejora: "",
    };
    onPiItemsChange([...(piItems || []), nuevo_pi]);
  };

  const actualizar_pi = (pi_id: string, campo: keyof ConclusionesPiItem, valor: string) => {
    onPiItemsChange(
      (piItems || []).map((registro_pi) =>
        registro_pi.id === pi_id ? { ...registro_pi, [campo]: valor } : registro_pi,
      ),
    );
  };

  const eliminar_pi = (pi_id: string) => {
    onPiItemsChange((piItems || []).filter((registro_pi) => registro_pi.id !== pi_id));
  };

  return (
    <StepCard
      title={translate("pdcaPhases.resumen.step33.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="p-4 space-y-6">
        <Accordion type="single" collapsible className="w-full bg-[#f8f9fa] rounded-md border">
          <AccordionItem value="instructions" className="border-b-0">
            <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-[#e9ecef] transition-colors">
              <div className="flex items-center gap-2 text-[#6c757d]">
                <div className="h-5 w-5 rounded-full bg-[#e2e3e5] flex items-center justify-center text-xs font-bold text-[#6c757d]">
                  i
                </div>
                <span className="font-bold text-sm">
                  {translate("pdcaPhases.resumen.step33.instructionsTitle")}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="font-bold">{translate("pdcaPhases.resumen.step33.instructionsTitle")}</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>{translate("pdcaPhases.resumen.step33.inst1")}</li>
                <li>{translate("pdcaPhases.resumen.step33.inst2")}</li>
                <li>{translate("pdcaPhases.resumen.step33.inst3")}</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
          <TablaConclusionesKpi datos_kpi={datos_kpi_actuales} al_cambiar_campo={cambiar_campo_kpi} />
          <TablaConclusionesPi
            elementos_pi={piItems}
            al_agregar_pi={agregar_pi}
            al_actualizar_pi={actualizar_pi}
            al_eliminar_pi={eliminar_pi}
          />
        </div>

        <SeccionStoryboardConclusiones
          html_storyboard={storyboardHtml}
          al_cambiar_html_storyboard={onStoryboardHtmlChange}
          es_editable={isEditable}
          imagen_storyboard={storyboardImage}
          al_cambiar_imagen_storyboard={onStoryboardImageChange}
        />
      </div>
    </StepCard>
  );
};
