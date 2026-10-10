import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckSquare, Square } from "lucide-react";
import type { DefinicionMeta, VpoCheckpointItem } from "@/data/pdca";

interface Props {
  meta: DefinicionMeta;
  desdeVal: string;
  aVal: string;
  unidad: string;
  vpoChecks: VpoCheckpointItem[];
}

export const ResumenDetailsAccordion: React.FC<Props> = ({
  meta,
  desdeVal,
  aVal,
  unidad,
  vpoChecks,
}) => {
  const { t } = useTranslation();
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="detalles-proyecto"
        className="border rounded-xl bg-card shadow-sm overflow-hidden"
      >
        <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:no-underline">
          {t('pdcaResumen.viewDetailsStep1And2')}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paso 1 */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('pdcaResumen.step1ProjectStatement')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2 text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  <span className="font-medium text-muted-foreground">{t('pdcaResumen.>kpi<')}</span>
                  <span>{meta.kpi || "-"}</span>
                  <span className="font-medium text-muted-foreground">{t('pdcaResumen.>pis<')}</span>
                  <span className="leading-snug">{meta.pis || "-"}</span>
                  <span className="font-medium text-muted-foreground">{t('pdcaResumen.>goal<')}</span>
                  <span>
                    {desdeVal} → {aVal} {unidad}
                  </span>
                  <span className="font-medium text-muted-foreground">{t('pdcaResumen.>benchmark<')}</span>
                  <span>{(meta as any).benchmark || "-"}</span>
                  <span className="font-medium text-muted-foreground">{t('pdcaResumen.>responsible<')}</span>
                  <span>{(meta as any).responsable || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Paso 2: SDCA Checklist */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('pdcaResumen.step2SdcaChecklist')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {vpoChecks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {check.status === "YES" ? (
                        <CheckSquare className="size-3.5 text-green-500 mt-0.5 shrink-0" />
                      ) : check.status === "NO" ? (
                        <Square className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                      ) : (
                        <div className="size-3.5 border rounded text-[7px] flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                          N/A
                        </div>
                      )}
                      <span className="text-xs leading-snug">{check.checkpoint}</span>
                    </div>
                  ))}
                  {vpoChecks.length === 0 && (
                    <p className="text-xs text-muted-foreground">{t('pdcaResumen.noCheckpointsRegistered')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
