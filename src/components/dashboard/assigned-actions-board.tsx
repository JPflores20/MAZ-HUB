/**
 * assigned-actions-board.tsx
 * Bandeja unificada de compromisos y acciones asignadas (PDCA + RDA) con semáforo de vencimiento
 * y acceso directo de 1 clic al proyecto correspondiente.
 */
import React, { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  ListChecks,
  UserCheck,
} from "lucide-react";
import { differenceInCalendarDays, isValid, parse, parseISO, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Pdca } from "@/data/pdca";
import type { Rda } from "@/data/rda";
import { getRdaDisplayName } from "@/components/RDA/rda-name";

export interface UnifiedActionItem {
  id: string;
  module: "PDCA" | "RDA";
  subType: string;
  projectId: string;
  projectTitle: string;
  description: string;
  owner: string;
  deadlineRaw: string;
  deadlineDate: Date | null;
  done: boolean;
  urgency: "completed" | "overdue" | "soon" | "ontime";
  daysDiff: number | null;
}

interface AssignedActionsBoardProps {
  pdcas: Pdca[];
  rdas: Rda[];
  currentUserName?: string | undefined;
  currentUserEmail?: string | undefined;
}

function parseFlexibleDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "Sin fecha") return null;

  // Intentar ISO (yyyy-MM-dd)
  const iso = parseISO(trimmed);
  if (isValid(iso)) return startOfDay(iso);

  // Intentar dd/MM/yyyy
  const dmy = parse(trimmed, "dd/MM/yyyy", new Date());
  if (isValid(dmy)) return startOfDay(dmy);

  return null;
}

function computeUrgency(
  done: boolean,
  deadlineDate: Date | null,
): { urgency: UnifiedActionItem["urgency"]; daysDiff: number | null } {
  if (done) return { urgency: "completed", daysDiff: null };
  if (!deadlineDate) return { urgency: "ontime", daysDiff: null };

  const today = startOfDay(new Date());
  const diff = differenceInCalendarDays(deadlineDate, today);
  if (diff < 0) return { urgency: "overdue", daysDiff: diff };
  if (diff <= 7) return { urgency: "soon", daysDiff: diff };
  return { urgency: "ontime", daysDiff: diff };
}

export function AssignedActionsBoard({
  pdcas,
  rdas,
  currentUserName = "",
  currentUserEmail = "",
}: AssignedActionsBoardProps) {
  const navigate = useNavigate();
  const [scopeFilter, setScopeFilter] = useState<"mine" | "all">("all");
  const [moduleFilter, setModuleFilter] = useState<"ALL" | "PDCA" | "RDA">("ALL");
  const [statusFilter, setStatusFilter] = useState<"pending" | "overdue" | "soon" | "completed">(
    "pending",
  );

  const allActions = useMemo<UnifiedActionItem[]>(() => {
    const list: UnifiedActionItem[] = [];

    // 1. Acciones de PDCA
    pdcas.forEach((pdca) => {
      (pdca.acciones || []).forEach((acc, idx) => {
        const desc = (acc.accion || acc.what || acc.tema || "").trim();
        if (!desc) return;
        const owner = (acc.responsable || acc.who || "Sin asignar").trim();
        const deadlineRaw = (acc.fecha || acc.when || "").trim();
        const deadlineDate = parseFlexibleDate(deadlineRaw);
        const done = Boolean(acc.done || acc.status === "Completada");
        const { urgency, daysDiff } = computeUrgency(done, deadlineDate);

        list.push({
          id: `pdca-${pdca.id}-${acc.id || idx}`,
          module: "PDCA",
          subType: "Fase DO",
          projectId: pdca.id,
          projectTitle: pdca.titulo || `PDCA ${pdca.id}`,
          description: desc,
          owner,
          deadlineRaw: deadlineRaw || "Sin fecha",
          deadlineDate,
          done,
          urgency,
          daysDiff,
        });
      });
    });

    // 2. Acciones de RDA (PDA Paso 12, Acciones Inmediatas Paso 3 y Plan de Validación Paso 9)
    rdas.forEach((rda) => {
      const rdaTitle = getRdaDisplayName(rda, `RDA ${rda.id}`);

      (rda.pda || []).forEach((acc, idx) => {
        const desc = (acc.accion || acc.what || acc.tema || "").trim();
        if (!desc) return;
        const owner = (acc.responsable || acc.who || "Sin asignar").trim();
        const deadlineRaw = (acc.fecha || acc.when || "").trim();
        const deadlineDate = parseFlexibleDate(deadlineRaw);
        const done = Boolean(acc.done || acc.status === "Completada");
        const { urgency, daysDiff } = computeUrgency(done, deadlineDate);

        list.push({
          id: `rda-pda-${rda.id}-${acc.id || idx}`,
          module: "RDA",
          subType: "PDA (Paso 12)",
          projectId: rda.id,
          projectTitle: rdaTitle,
          description: desc,
          owner,
          deadlineRaw: deadlineRaw || "Sin fecha",
          deadlineDate,
          done,
          urgency,
          daysDiff,
        });
      });

      (rda.immediateActions || []).forEach((acc, idx) => {
        const desc = (acc.accion || acc.causaPotencial || "").trim();
        if (!desc) return;
        const owner = (acc.responsable || "Sin asignar").trim();
        const deadlineRaw = (acc.fechaLimite || "").trim();
        const deadlineDate = parseFlexibleDate(deadlineRaw);
        const done = Boolean(acc.estatus === "Completa");
        const { urgency, daysDiff } = computeUrgency(done, deadlineDate);

        list.push({
          id: `rda-imm-${rda.id}-${acc.id || idx}`,
          module: "RDA",
          subType: "Contención (Paso 3)",
          projectId: rda.id,
          projectTitle: rdaTitle,
          description: desc,
          owner,
          deadlineRaw: deadlineRaw || "Sin fecha",
          deadlineDate,
          done,
          urgency,
          daysDiff,
        });
      });

      (rda.validationActions || []).forEach((val, idx) => {
        const desc = (val.accion || val.causaPotencial || "").trim();
        if (!desc) return;
        const owner = (val.responsable || "Sin asignar").trim();
        const deadlineRaw = (val.fechaLimite || "").trim();
        const deadlineDate = parseFlexibleDate(deadlineRaw);
        const done = Boolean(
          val.estatus === "Completa" || val.esCausaRaiz === "SI" || val.esCausaRaiz === "NO",
        );
        const { urgency, daysDiff } = computeUrgency(done, deadlineDate);

        list.push({
          id: `rda-val-${rda.id}-${val.id || idx}`,
          module: "RDA",
          subType: "Validación (Paso 9)",
          projectId: rda.id,
          projectTitle: rdaTitle,
          description: desc,
          owner,
          deadlineRaw: deadlineRaw || "Sin fecha",
          deadlineDate,
          done,
          urgency,
          daysDiff,
        });
      });
    });

    // Ordenar primero las vencidas, luego próximas a vencer, luego en tiempo, y al final completadas
    const priorityOrder: Record<UnifiedActionItem["urgency"], number> = {
      overdue: 0,
      soon: 1,
      ontime: 2,
      completed: 3,
    };

    return list.sort((a, b) => {
      if (priorityOrder[a.urgency] !== priorityOrder[b.urgency]) {
        return priorityOrder[a.urgency] - priorityOrder[b.urgency];
      }
      if (a.daysDiff !== null && b.daysDiff !== null) {
        return a.daysDiff - b.daysDiff;
      }
      return 0;
    });
  }, [pdcas, rdas]);

  const userLower = currentUserName.trim().toLowerCase();
  const emailLower = currentUserEmail.trim().toLowerCase();

  const isOwnedByCurrentUser = (owner: string) => {
    const o = owner.toLowerCase();
    return (
      (Boolean(userLower) && o.includes(userLower)) ||
      (Boolean(emailLower) && o.includes(emailLower))
    );
  };

  const filteredActions = useMemo(() => {
    return allActions.filter((item) => {
      if (scopeFilter === "mine" && !isOwnedByCurrentUser(item.owner)) {
        return false;
      }
      if (moduleFilter !== "ALL" && item.module !== moduleFilter) {
        return false;
      }
      if (statusFilter === "pending" && item.done) return false;
      if (statusFilter === "overdue" && item.urgency !== "overdue") return false;
      if (statusFilter === "soon" && item.urgency !== "soon") return false;
      if (statusFilter === "completed" && !item.done) return false;
      return true;
    });
  }, [allActions, scopeFilter, moduleFilter, statusFilter, userLower, emailLower]);

  const counts = useMemo(() => {
    const base = scopeFilter === "mine"
      ? allActions.filter((a) => isOwnedByCurrentUser(a.owner))
      : allActions;
    return {
      overdue: base.filter((a) => a.urgency === "overdue").length,
      soon: base.filter((a) => a.urgency === "soon").length,
      pending: base.filter((a) => !a.done).length,
      completed: base.filter((a) => a.done).length,
    };
  }, [allActions, scopeFilter, userLower, emailLower]);

  const handleOpenProject = (item: UnifiedActionItem) => {
    try {
      if (item.module === "RDA") {
        sessionStorage.setItem("maz_hub_open_rda_id", item.projectId);
        void navigate({ to: "/rda" });
      } else {
        sessionStorage.setItem("maz_hub_open_pdca_id", item.projectId);
        void navigate({ to: "/" });
      }
    } catch {
      // Ignorar errores de sessionStorage
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Bandeja Unificada de Acciones y Compromisos (PDCA + RDA)
            </h2>
            <p className="text-xs text-muted-foreground">
              Seguimiento consolidado de planes de acción (DO), PDA, contención y validaciones con semáforo de vencimiento.
            </p>
          </div>
        </div>

        {/* Filtros de alcance y módulo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setScopeFilter("all")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                scopeFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos mis proyectos
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter("mine")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                scopeFilter === "mine"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="size-3.5" /> Asignadas a mí
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5 text-xs">
            {(["ALL", "PDCA", "RDA"] as const).map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setModuleFilter(mod)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  moduleFilter === mod
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mod === "ALL" ? "PDCA + RDA" : mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Píldoras de semáforo */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1">
          <Filter className="size-3.5" /> Estatus:
        </span>
        <button
          type="button"
          onClick={() => setStatusFilter("pending")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            statusFilter === "pending"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          Pendientes ({counts.pending})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("overdue")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            statusFilter === "overdue"
              ? "border-red-600 bg-red-600 text-white"
              : "border-red-200 dark:border-red-900/50 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20"
          }`}
        >
          <AlertTriangle className="size-3.5" /> Vencidas ({counts.overdue})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("soon")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            statusFilter === "soon"
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-amber-200 dark:border-amber-900/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          <Clock className="size-3.5" /> Próximas ≤ 7d ({counts.soon})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("completed")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            statusFilter === "completed"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          <CheckCircle2 className="size-3.5" /> Completadas ({counts.completed})
        </button>
      </div>

      {/* Tabla de acciones */}
      <div className="mt-4 overflow-x-auto">
        {filteredActions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            No se encontraron acciones con los filtros seleccionados.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Módulo / Origen</th>
                <th className="py-2.5 px-3">Proyecto</th>
                <th className="py-2.5 px-3">Acción / Compromiso</th>
                <th className="py-2.5 px-3">Responsable</th>
                <th className="py-2.5 px-3">Fecha Límite</th>
                <th className="py-2.5 px-3">Semáforo</th>
                <th className="py-2.5 px-3 text-right">Ir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredActions.slice(0, 12).map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={
                          item.module === "PDCA"
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px]"
                            : "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px]"
                        }
                      >
                        {item.module}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{item.subType}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 max-w-[200px] truncate font-medium text-xs">
                    {item.projectTitle}
                  </td>
                  <td className="py-2.5 px-3 max-w-[320px] text-xs font-semibold text-foreground">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs text-muted-foreground">
                    {item.owner}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" /> {item.deadlineRaw}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {item.urgency === "overdue" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-300">
                        <AlertTriangle className="size-3" />
                        Vencida ({Math.abs(item.daysDiff ?? 0)}d)
                      </span>
                    ) : item.urgency === "soon" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                        <Clock className="size-3" />
                        {item.daysDiff === 0 ? "Vence hoy" : `En ${item.daysDiff}d`}
                      </span>
                    ) : item.urgency === "completed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3" />
                        Completada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                        En tiempo
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenProject(item)}
                      className="h-7 px-2 text-xs text-primary hover:text-primary"
                    >
                      Abrir <ExternalLink className="ml-1 size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
