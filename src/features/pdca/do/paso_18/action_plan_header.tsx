/**
 * @fileoverview Encabezado declarativo de columnas para la tabla del Plan de Acción (Paso 18 / 19).
 */
import type { TFunction } from "i18next";
import { cn } from "@/shared/utils/class_names";
import { TableHead, TableHeader, TableRow } from "@/shared/ui/table";

function obtener_columnas_action_plan(translate: TFunction) {
  return [
    { texto: translate("pdcaTables.actionPlan.topic"), ancho: "min-w-[200px]" },
    { texto: translate("pdcaTables.actionPlan.rootCause"), ancho: "min-w-[200px]" },
    { texto: translate("pdcaTables.actionPlan.action"), ancho: "min-w-[200px]" },
    { texto: "Análisis 5 medios básicos para cero averías", ancho: "min-w-[250px]" },
    { texto: translate("pdcaTables.actionPlan.factors.safety"), ancho: "min-w-[100px]" },
    { texto: translate("pdcaTables.actionPlan.factors.quality"), ancho: "min-w-[100px]" },
    { texto: translate("pdcaTables.actionPlan.factors.cost"), ancho: "min-w-[100px]" },
    { texto: translate("pdcaTables.actionPlan.factors.environment"), ancho: "min-w-[100px]" },
    { texto: translate("pdcaTables.actionPlan.factors.service"), ancho: "min-w-[100px]" },
    { texto: translate("pdcaTables.actionPlan.resultsR"), ancho: "min-w-[110px]" },
    { texto: translate("pdcaTables.actionPlan.prioritize"), ancho: "min-w-[95px]" },
    { texto: translate("pdcaTables.actionPlan.quickWin"), ancho: "min-w-[95px]" },
    { texto: translate("pdcaTables.actionPlan.techRequired"), ancho: "min-w-[110px]" },
    { texto: translate("pdcaTables.actionPlan.comments"), ancho: "min-w-[180px]" },
    { texto: translate("pdcaTables.actionPlan.responsible"), ancho: "min-w-[140px]" },
    { texto: translate("pdcaTables.actionPlan.date"), ancho: "min-w-[110px]" },
    { texto: translate("pdcaTables.actionPlan.status"), ancho: "min-w-[110px]" },
    { texto: translate("pdcaTables.actionPlan.sdca"), ancho: "min-w-[100px]" },
  ];
}

/**
 * Renderiza el encabezado azul institucional de las 19 columnas de la matriz de Plan de Acción.
 */
export function ActionPlanTableHeader({ translate }: { translate: TFunction }) {
  const columnas = obtener_columnas_action_plan(translate);
  return (
    <TableHeader>
      <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
        <TableHead className="w-8 h-8 py-1 px-1 border-r border-white/20" />
        {columnas.map((columna) => (
          <TableHead
            key={columna.texto}
            className={cn(
              "text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center leading-tight",
              columna.ancho,
            )}
          >
            {columna.texto}
          </TableHead>
        ))}
        <TableHead className="w-8 h-8 py-1 px-1" />
      </TableRow>
    </TableHeader>
  );
}
