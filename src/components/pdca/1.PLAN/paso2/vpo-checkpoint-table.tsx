import React from "react";
import { FileText } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type VpoCheckpointItem } from "@/data/pdca";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { FilaCheckpointVpo } from "./vpo-checkpoint-row";

interface PropiedadesTablaVpo {
  checkpoints: VpoCheckpointItem[];
  onChange: (nuevosCheckpoints: VpoCheckpointItem[]) => void;
  problemaTexto: string;
  completedSteps: Set<string>;
  naSteps?: Set<string>;
  onToggleStep: (idPaso: string) => void;
  onToggleNa?: (idPaso: string) => void;
}

export function VpoCheckpointTable({
  checkpoints: listaCheckpoints,
  onChange: alCambiarCheckpoints,
  problemaTexto: textoProblemaDefinido,
  completedSteps: pasosCompletados,
  naSteps: pasosNoAplica,
  onToggleStep: alAlternarPaso,
  onToggleNa: alAlternarPasoNoAplica,
}: PropiedadesTablaVpo) {
  
  const actualizarEstatus = (idItem: string, nuevoEstatus: "YES" | "NO" | "N/A" | "") => {
    const listaActualizada = listaCheckpoints.map((itemActual) =>
      itemActual.id === idItem ? { ...itemActual, status: nuevoEstatus } : itemActual
    );
    alCambiarCheckpoints(listaActualizada);
  };

  const actualizarEvidencia = (idItem: string, textoEvidencia: string) => {
    const listaActualizada = listaCheckpoints.map((itemActual) =>
      itemActual.id === idItem ? { ...itemActual, evidencia: textoEvidencia } : itemActual
    );
    alCambiarCheckpoints(listaActualizada);
  };

  const conteoCumplidos = listaCheckpoints.filter((item) => item.status === "YES").length;
  const porcentajeCumplimiento = Math.round((conteoCumplidos / listaCheckpoints.length) * 100);

  return (
    <StepCard
      title="PASO 2: FASE SDCA CHECKLIST"
      isStepCompleted={pasosCompletados.has("step-2")}
      onToggleStep={() => alAlternarPaso("step-2")}
      isNa={pasosNoAplica?.has("step-2")}
      onToggleNa={() => alAlternarPasoNoAplica?.("step-2")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <StepInstructions>
          <p className="mb-2">
            <strong>PHASE SDCA CHECKLIST:</strong> Este checklist evalúa la madurez y
            estandarización del proceso afectado según los pilares del Sistema de Gestión VPO de
            Grupo Modelo.
          </p>
          <p>
            Evalúa cada punto en el contexto de tu problema. Registra las evidencias o comentarios
            de soporte para cada ítem y selecciona el status correspondiente (YES / NO / N/A). La
            brecha identificada servirá para alimentar el plan de acción (Kanban).
          </p>
        </StepInstructions>

        <div className="w-full flex rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden shadow-sm">
          <div className="flex w-[120px] shrink-0 items-center justify-center bg-white dark:bg-background border-r border-sky-500/30 p-4">
            <span className="font-bold text-sky-500 uppercase tracking-widest">GUÍA</span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm font-medium text-foreground/90">
            <p>
              <strong>Si el score es inferior al 70%</strong> - priorizar las acciones entre los
              miembros del equipo para cerrar las brechas en los puntos más relevantes del problema.
              Sin embargo, el equipo debe proceder en paralelo si los datos iniciales indican que
              hay otros aspectos del problema que estos items del SDCA no pueden abordar sin datos y
              análisis adicionales.
            </p>
            <p>
              <strong>Si el score es mayor al 70%</strong> - proceda directamente al resto de este
              toolkit. Cualquier brecha en los puntos anteriores puede asignarse como acciones para
              los miembros del equipo si es relevante para el problema y es probable que tenga un
              impacto. Utilice la matriz de impacto en la pestaña de action log, si es necesario,
              para ayudar a decidir si deben completarse o no.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Progreso VPO Checkpoint:
          </span>
          <span
            className={cn(
              "font-mono text-xl font-extrabold",
              porcentajeCumplimiento >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            )}
          >
            {porcentajeCumplimiento}% ({conteoCumplidos}/{listaCheckpoints.length} YES)
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            porcentajeCumplimiento >= 70
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-amber-500 to-rose-500"
          )}
          style={{ width: `${porcentajeCumplimiento}%` }}
        />
      </div>

      {/* Banner de Descripción del Problema */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Descripción del problema (Definición del Problema)
            </span>
            <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">
              {textoProblemaDefinido ||
                "Sin especificar (llena la casilla de Descripción del Problema en el Paso 1)"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Oficial VPO Checkpoint */}
      <div className="overflow-hidden border border-border/80 rounded-xl shadow-md bg-card">
        <Table className="text-xs border-collapse">
          <TableHeader className="bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white">
            <TableRow className="border-b border-slate-800/80">
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-56 border-r border-slate-800/60">
                BLOQUE PILAR GESTIÓN
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 border-r border-slate-800/60">
                VPO TOOL CHECKPOINT
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-72 border-r border-slate-800/60">
                EVIDENCIAS / COMENTARIOS
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-44 text-center">
                ESTATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listaCheckpoints.map((itemCheckpointActivo) => (
              <FilaCheckpointVpo
                key={itemCheckpointActivo.id}
                itemCheckpoint={itemCheckpointActivo}
                alActualizarEstatus={actualizarEstatus}
                alActualizarEvidencia={actualizarEvidencia}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </StepCard>
  );
}
