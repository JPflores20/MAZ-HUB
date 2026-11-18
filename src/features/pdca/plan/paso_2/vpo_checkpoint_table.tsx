/**
 * @fileoverview Tabla completa de evaluación SDCA Checklist (VPO Checkpoints) del Paso 2.
 */
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/utils/class_names";
import type { VpoCheckpointItem } from "@/domain/pdca";
import { StepCard } from "@/shared/ui/step_card";
import { StepInstructions } from "../../components/step_instructions";
import { FilaCheckpointVpo } from "./vpo_checkpoint_row";

interface PropiedadesTablaVpo {
  checkpoints: VpoCheckpointItem[];
  onChange: (nuevos_checkpoints: VpoCheckpointItem[]) => void;
  problemaTexto: string;
  completedSteps: Set<string>;
  naSteps?: Set<string> | undefined;
  onToggleStep: (paso_id: string) => void;
  onToggleNa?: ((paso_id: string) => void) | undefined;
}

/**
 * Muestra guía SDCA, barra de cumplimiento VPO, problema declarado y matriz de puntos de control.
 */
export function VpoCheckpointTable({
  checkpoints: lista_checkpoints,
  onChange: al_cambiar_checkpoints,
  problemaTexto: texto_problema,
  completedSteps: pasos_completados,
  naSteps: pasos_no_aplica,
  onToggleStep: al_alternar_paso,
  onToggleNa: al_alternar_na,
}: PropiedadesTablaVpo) {
  const { t: translate } = useTranslation();

  const actualizar_estatus = (
    checkpoint_id: string,
    nuevo_estatus: "YES" | "NO" | "N/A" | "",
  ) => {
    al_cambiar_checkpoints(
      lista_checkpoints.map((checkpoint_item) =>
        checkpoint_item.id === checkpoint_id
          ? { ...checkpoint_item, status: nuevo_estatus }
          : checkpoint_item,
      ),
    );
  };

  const actualizar_evidencia = (checkpoint_id: string, texto_evidencia: string) => {
    al_cambiar_checkpoints(
      lista_checkpoints.map((checkpoint_item) =>
        checkpoint_item.id === checkpoint_id
          ? { ...checkpoint_item, evidencia: texto_evidencia }
          : checkpoint_item,
      ),
    );
  };

  const conteo_cumplidos = lista_checkpoints.filter(
    (checkpoint_item) => checkpoint_item.status === "YES",
  ).length;
  const porcentaje_cumplimiento = Math.round(
    (conteo_cumplidos / Math.max(lista_checkpoints.length, 1)) * 100,
  );

  return (
    <StepCard
      title={translate("pdcaPlan.dynamic.paso2FaseSdcaChecklist")}
      isStepCompleted={pasos_completados.has("step-2")}
      onToggleStep={() => al_alternar_paso("step-2")}
      isNa={pasos_no_aplica?.has("step-2")}
      onToggleNa={() => al_alternar_na?.("step-2")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <StepInstructions>
          <p className="mb-2">
            <strong>{translate("pdcaPlan.dynamic.phaseSdcaChecklist")}</strong>{" "}
            {translate("pdcaPlan.dynamic.esteChecklistEvalALa")}
          </p>
          <p>{translate("pdcaPlan.dynamic.evalACadaPuntoEn")}</p>
        </StepInstructions>

        <div className="w-full flex rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden shadow-sm">
          <div className="flex w-[120px] shrink-0 items-center justify-center bg-white dark:bg-background border-r border-sky-500/30 p-4">
            <span className="font-bold text-sky-500 uppercase tracking-widest">
              {translate("pdcaPlan.dynamic.guA")}
            </span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm font-medium text-foreground/90">
            <p>
              <strong>{translate("pdcaPlan.dynamic.siElScoreEsInferior")}</strong>{" "}
              {translate("pdcaPlan.dynamic.priorizarLasAccionesEntreLos")}
            </p>
            <p>
              <strong>{translate("pdcaPlan.dynamic.siElScoreEsMayor")}</strong>{" "}
              {translate("pdcaPlan.dynamic.procedaDirectamenteAlRestoDe")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {translate("pdcaPlan.dynamic.progresoVpoCheckpoint")}
          </span>
          <span
            className={cn(
              "font-mono text-xl font-extrabold",
              porcentaje_cumplimiento >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {porcentaje_cumplimiento}% ({conteo_cumplidos}/{lista_checkpoints.length}{" "}
            {translate("pdcaPlan.dynamic.yes2")}
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            porcentaje_cumplimiento >= 70
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-amber-500 to-rose-500",
          )}
          style={{ width: `${porcentaje_cumplimiento}%` }}
        />
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              {translate("pdcaPlan.dynamic.descripciNDelProblemaDefinici")}
            </span>
            <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">
              {texto_problema ||
                "Sin especificar (llena la casilla de Descripción del Problema en el Paso 1)"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border border-border/80 rounded-xl shadow-md bg-card">
        <Table className="text-xs border-collapse">
          <TableHeader className="bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white">
            <TableRow className="border-b border-slate-800/80">
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-56 border-r border-slate-800/60">
                {translate("pdcaPlan.dynamic.bloquePilarGestiN")}
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 border-r border-slate-800/60">
                {translate("pdcaPlan.dynamic.vpoToolCheckpoint")}
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-72 border-r border-slate-800/60">
                {translate("pdcaPlan.dynamic.evidenciasComentarios")}
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-44 text-center">
                {translate("pdcaPlan.dynamic.estatus")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista_checkpoints.map((checkpoint_activo) => (
              <FilaCheckpointVpo
                key={checkpoint_activo.id}
                item_checkpoint={checkpoint_activo}
                al_actualizar_estatus={actualizar_estatus}
                al_actualizar_evidencia={actualizar_evidencia}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </StepCard>
  );
}
