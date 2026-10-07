import React from "react";
import { ConclusionesKpiData, ConclusionesPiItem } from "@/data/pdca";
import { StepCard } from "@/components/ui/step-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TablaConclusionesKpi } from "./components/conclusiones-kpi-table";
import { TablaConclusionesPi } from "./components/conclusiones-pi-table";
import { SeccionStoryboardConclusiones } from "./components/conclusiones-storyboard";

export interface ConclusionesStepProps {
  isStepCompleted: boolean;
  onToggleStep: () => void;
  isNa?: boolean | undefined;
  onToggleNa?: (() => void) | undefined;
  isEditable: boolean;
  kpiData: ConclusionesKpiData | undefined;
  onKpiDataChange: (data: ConclusionesKpiData) => void;
  piItems: ConclusionesPiItem[];
  onPiItemsChange: (items: ConclusionesPiItem[]) => void;
  storyboardHtml?: string | undefined;
  onStoryboardHtmlChange?: ((html: string) => void) | undefined;
  storyboardImage?: string | undefined;
  onStoryboardImageChange?: ((img?: string) => void) | undefined;
}

/**
 * Paso 33: Conclusiones.
 * Muestra las tablas de progreso final de KPI y PI, además del editor de Storyboard.
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
  const datosKpi = kpiData || {
    fechaFinalizacion: "",
    mejoroPi: "",
    mejoroKpi: "",
    kpiName: "",
    kpiDe: "",
    kpiA: "",
    kpiVerdeEs: "Más alto",
    kpiMejora: "",
  };

  const cambiarCampoKpi = (campo: keyof ConclusionesKpiData, valor: string) => {
    onKpiDataChange({ ...datosKpi, [campo]: valor });
  };

  const agregarPi = () => {
    const nuevoItem: ConclusionesPiItem = {
      id: crypto.randomUUID(),
      piName: "",
      piDe: "",
      piA: "",
      piVerdeEs: "Más alto",
      piMejora: "",
    };
    onPiItemsChange([...(piItems || []), nuevoItem]);
  };

  const actualizarPi = (id: string, campo: keyof ConclusionesPiItem, valor: string) => {
    onPiItemsChange(
      (piItems || []).map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const eliminarPi = (id: string) => {
    onPiItemsChange((piItems || []).filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 33: CONCLUSIONES"
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
                <span className="font-bold text-sm">Instrucciones</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="font-bold">Instrucciones</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Llene la fecha de finalización</li>
                <li>
                  Llene la información general del KPI incluyendo el valor inicial del KPI, el valor
                  final del KPI. Si un aumento del valor equivale a una mejora del KPI, seleccione
                  "Más alto". De lo contrario, seleccione "Más bajo".
                </li>
                <li>
                  Si su PDCA tenía un enfoque más limitado en un PI específico, entonces llene la
                  información del PI para mostrar el PI antes y después del PDCA.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
          <TablaConclusionesKpi datosKpi={datosKpi} alCambiarCampo={cambiarCampoKpi} />
          <TablaConclusionesPi
            elementosPi={piItems}
            alAgregarPi={agregarPi}
            alActualizarPi={actualizarPi}
            alEliminarPi={eliminarPi}
          />
        </div>

        <SeccionStoryboardConclusiones
          htmlStoryboard={storyboardHtml}
          alCambiarHtmlStoryboard={onStoryboardHtmlChange}
          esEditable={isEditable}
          imagenStoryboard={storyboardImage}
          alCambiarImagenStoryboard={onStoryboardImageChange}
        />
      </div>
    </StepCard>
  );
};
