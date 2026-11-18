/**
 * @fileoverview Acordeón interactivo en pantalla (y expandido al imprimir) con Project Statement y SDCA Check.
 */
import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { DefinicionMeta, VpoCheckpointItem } from "@/domain/pdca";

interface PropiedadesDetallesResumen {
  meta: DefinicionMeta;
  desde_val: string;
  a_val: string;
  unidad: string;
  vpo_checks: VpoCheckpointItem[];
}

interface PropiedadesTarjetasContenido extends PropiedadesDetallesResumen {
  is_print?: boolean;
}

const TarjetasDetallesContenido: React.FC<PropiedadesTarjetasContenido> = ({
  meta,
  desde_val,
  a_val,
  unidad,
  vpo_checks,
  is_print = false,
}) => {
  const { t: translate } = useTranslation();
  const meta_extendida = meta as DefinicionMeta & { benchmark?: string; responsable?: string };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
      <Card className="print:shadow-none print:border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {translate("pdcaResumen.step1ProjectStatement")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2 text-xs">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
            <span className="font-medium text-muted-foreground">{translate("pdcaResumen.kpi", "KPI")}</span>
            <span className="font-semibold">{meta.kpi || "-"}</span>
            <span className="font-medium text-muted-foreground">{translate("pdcaResumen.pis", "PIs")}</span>
            <span className="leading-snug">{meta.pis || "-"}</span>
            <span className="font-medium text-muted-foreground">{translate("pdcaResumen.goal", "Meta")}</span>
            <span className="font-semibold">
              {desde_val} → {a_val} {unidad}
            </span>
            <span className="font-medium text-muted-foreground">
              {translate("pdcaResumen.benchmark", "Benchmark")}
            </span>
            <span>{meta_extendida.benchmark || "-"}</span>
            <span className="font-medium text-muted-foreground">
              {translate("pdcaResumen.responsible", "Responsable")}
            </span>
            <span>{meta_extendida.responsable || "-"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {translate("pdcaResumen.step2SdcaChecklist")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div
            className={`space-y-1.5 ${is_print ? "max-h-none overflow-visible" : "max-h-[160px] overflow-y-auto pr-1"}`}
          >
            {vpo_checks.map((checkpoint_item, indice_check) => (
              <div key={`${checkpoint_item.checkpoint}-${indice_check}`} className="flex items-start gap-2">
                {checkpoint_item.status === "YES" ? (
                  <CheckSquare className="size-3.5 text-green-500 mt-0.5 shrink-0" />
                ) : checkpoint_item.status === "NO" ? (
                  <Square className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <div className="size-3.5 border rounded text-[7px] flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                    N/A
                  </div>
                )}
                <span className="text-xs leading-snug">{checkpoint_item.checkpoint}</span>
              </div>
            ))}
            {vpo_checks.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {translate("pdcaResumen.noCheckpointsRegistered")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Muestra la ficha técnica inicial del PDCA colapsable en pantalla y visible en modo impresión.
 */
export const ResumenDetailsAccordion: React.FC<PropiedadesDetallesResumen> = ({
  meta,
  desde_val,
  a_val,
  unidad,
  vpo_checks,
}) => {
  const { t: translate } = useTranslation();

  return (
    <>
      <div className="print:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="detalles-proyecto" className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:no-underline">
              {translate("pdcaResumen.viewDetailsStep1And2", "PROJECT STATEMENT y SDCA CHECKLIST")}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
              <TarjetasDetallesContenido
                meta={meta}
                desde_val={desde_val}
                a_val={a_val}
                unidad={unidad}
                vpo_checks={vpo_checks}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="hidden print:block border rounded-xl bg-card shadow-none p-4 space-y-3 print:break-inside-avoid">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
          {translate("pdcaResumen.viewDetailsStep1And2", "PROJECT STATEMENT y SDCA CHECKLIST")}
        </h3>
        <TarjetasDetallesContenido
          meta={meta}
          desde_val={desde_val}
          a_val={a_val}
          unidad={unidad}
          vpo_checks={vpo_checks}
          is_print
        />
      </div>
    </>
  );
};
