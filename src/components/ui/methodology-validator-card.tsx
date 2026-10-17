/**
 * methodology-validator-card.tsx
 * Validador automático de consistencia metodológica (Pre-Auditoría) para proyectos PDCA y reportes RDA.
 * Evalúa si el hilo conductor del análisis (5W2H -> Ishikawa -> Validación/5 Porqués -> Plan de Acción -> Estandarización)
 * está completo y sin cabos sueltos.
 */
import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import type { Rda, RdaQualityEval } from "@/data/rda";

export interface ValidationCriterion {
  id: string;
  label: string;
  detail: string;
  status: "ok" | "warning" | "missing";
  suggestedScore5: number; // 0 to 5
}

export function evaluateRdaMethodology(rda: Rda): {
  criteria: ValidationCriterion[];
  scorePct: number;
  suggestedQualityEval: Omit<RdaQualityEval, "conclusion">;
} {
  // 1. Definición 5W2H y Cabeza de Ishikawa
  const desc = rda.problemDescription;
  const filled5w = [desc?.que, desc?.como, desc?.cuando, desc?.donde, desc?.quien, desc?.cual].filter(
    (v) => Boolean(v && v.trim()),
  ).length;
  const hasIshikawaEffect = Boolean(
    (rda.ishikawa?.[0]?.effect && rda.ishikawa[0].effect.trim()) || (rda.title && rda.title.trim()),
  );
  const defStatus: ValidationCriterion["status"] =
    filled5w >= 5 && hasIshikawaEffect ? "ok" : filled5w >= 2 || hasIshikawaEffect ? "warning" : "missing";
  const defScore = defStatus === "ok" ? 5 : defStatus === "warning" ? 3 : 1;

  // 2. Evidencia y Contención Inmediata (Paso 2 y Paso 3)
  const evidenceCount =
    (rda.timeline || []).reduce((sum, ev) => sum + (ev.images?.length || 0), 0) +
    (rda.evidenciasValidacion?.length || 0) +
    (rda.evidenciasEliminacionCausa?.length || 0);
  const immediateCount = (rda.immediateActions || []).filter(
    (a) => Boolean((a.accion || a.causaPotencial || "").trim()),
  ).length;
  const eviStatus: ValidationCriterion["status"] =
    evidenceCount > 0 && immediateCount > 0
      ? "ok"
      : evidenceCount > 0 || immediateCount > 0
        ? "warning"
        : "missing";
  const eviScore = eviStatus === "ok" ? 5 : eviStatus === "warning" ? 3 : 1;

  // 3. Análisis de Causa Raíz (Ishikawa 6M -> Plan de Validación Paso 9 -> 5 Porqués Paso 11)
  const ishikawaCausesObj: Record<string, { text?: string }[]> = rda.ishikawa?.[0]?.causes || {};
  const totalIshikawaCauses = Object.values(ishikawaCausesObj).reduce<number>(
    (acc, list) =>
      acc + (Array.isArray(list) ? list.filter((c) => Boolean(c?.text?.trim())).length : 0),
    0,
  );
  const validationRows = (rda.validationActions || []).filter((r) =>
    Boolean((r.causaPotencial || r.accion || "").trim()),
  );
  const confirmedRootCauses = validationRows.filter((r) => r.esCausaRaiz === "SI");
  const rcStatus: ValidationCriterion["status"] =
    totalIshikawaCauses >= 3 && confirmedRootCauses.length >= 1
      ? "ok"
      : totalIshikawaCauses >= 1 || validationRows.length >= 1
        ? "warning"
        : "missing";
  const rcScore = rcStatus === "ok" ? 5 : rcStatus === "warning" ? 3 : 1;

  // 4. Acciones Correctivas / PDA (Paso 12) conectadas con Causas Raíz
  const pdaRows = (rda.pda || []).filter((a) => Boolean((a.accion || a.what || "").trim()));
  const pdaWithOwnerAndDate = pdaRows.filter(
    (a) =>
      Boolean((a.responsable || a.who || "").trim()) &&
      Boolean((a.fecha || a.when || "").trim()),
  );
  const pdaStatus: ValidationCriterion["status"] =
    pdaRows.length > 0 &&
    pdaWithOwnerAndDate.length === pdaRows.length &&
    pdaRows.length >= confirmedRootCauses.length
      ? "ok"
      : pdaRows.length > 0
        ? "warning"
        : "missing";
  const pdaScore = pdaStatus === "ok" ? 5 : pdaStatus === "warning" ? 3 : 1;

  // 5. Estandarización (LUP / Documentos) y Validación de Efectividad
  const hasLupOrStd =
    (rda.tablaEstandarizacion?.length || 0) > 0 ||
    Object.values(rda.checklistEstandarizacion || {}).some(Boolean) ||
    Boolean(rda.efectividadRda?.resultado?.trim());
  const completedPda = pdaRows.filter(
    (a) => Boolean(a.done || a.status === "Completada"),
  ).length;
  const effStatus: ValidationCriterion["status"] =
    hasLupOrStd && completedPda > 0 ? "ok" : hasLupOrStd || completedPda > 0 ? "warning" : "missing";
  const effScore = effStatus === "ok" ? 5 : effStatus === "warning" ? 3 : 1;

  const criteria: ValidationCriterion[] = [
    {
      id: "rda-def",
      label: "1. Definición 5W2H y Cabeza del Ishikawa",
      detail: `${filled5w}/6 preguntas 5W1H respondidas • Efecto en Ishikawa: ${hasIshikawaEffect ? "Definido" : "Pendiente"}`,
      status: defStatus,
      suggestedScore5: defScore,
    },
    {
      id: "rda-evi",
      label: "2. Evidencia Fotográfica y Contención (Paso 2 y 3)",
      detail: `${evidenceCount} evidencia(s) • ${immediateCount} acción(es) inmediata(s)`,
      status: eviStatus,
      suggestedScore5: eviScore,
    },
    {
      id: "rda-rc",
      label: "3. Hilo Conductor Ishikawa → Validación de Causa Raíz",
      detail: `${totalIshikawaCauses} causa(s) en 6M • ${validationRows.length} validada(s) • ${confirmedRootCauses.length} Causa(s) Raíz confirmada(s)`,
      status: rcStatus,
      suggestedScore5: rcScore,
    },
    {
      id: "rda-pda",
      label: "4. Cobertura de Causas Raíz en el PDA (Paso 12)",
      detail: `${pdaRows.length} acción(es) en PDA (${pdaWithOwnerAndDate.length} con responsable y fecha límite)`,
      status: pdaStatus,
      suggestedScore5: pdaScore,
    },
    {
      id: "rda-eff",
      label: "5. Cierre, LUP / Estandarización y Efectividad",
      detail: `${completedPda}/${pdaRows.length} acciones cerradas • Estándar/Efectividad: ${hasLupOrStd ? "Registrado" : "Pendiente"}`,
      status: effStatus,
      suggestedScore5: effScore,
    },
  ];

  const totalScore = defScore + eviScore + rcScore + pdaScore + effScore;
  const scorePct = Math.round((totalScore / 25) * 100);

  return {
    criteria,
    scorePct,
    suggestedQualityEval: {
      definicionProblema: defScore,
      evidencia: eviScore,
      causaRaiz: rcScore,
      accionesCorrectivas: pdaScore,
      validacionEfectividad: effScore,
    },
  };
}

export interface PdcaMethodologyInput {
  kpiLabel?: string | undefined;
  desdeVal?: string | undefined;
  aVal?: string | undefined;
  hasParetoOrCorrelation?: boolean | undefined;
  ishikawaCausesCount?: number | undefined;
  fiveWhysCount?: number | undefined;
  rootCauseConclusionsCount?: number | undefined;
  actionsCount?: number | undefined;
  actionsWithOwnerCount?: number | undefined;
  hasAfterComparison?: boolean | undefined;
  sdcaCheckedCount?: number | undefined;
}

export function evaluatePdcaMethodology(input: PdcaMethodologyInput): {
  criteria: ValidationCriterion[];
  scorePct: number;
} {
  const hasGoal = Boolean(
    input.kpiLabel &&
      input.kpiLabel !== "-" &&
      input.desdeVal &&
      input.desdeVal !== "-" &&
      input.aVal &&
      input.aVal !== "-",
  );
  const c1Status: ValidationCriterion["status"] = hasGoal ? "ok" : input.kpiLabel && input.kpiLabel !== "-" ? "warning" : "missing";

  const ishCount = input.ishikawaCausesCount ?? 0;
  const hasFactData = Boolean(input.hasParetoOrCorrelation);
  const c2Status: ValidationCriterion["status"] =
    ishCount >= 3 && hasFactData ? "ok" : ishCount >= 1 || hasFactData ? "warning" : "missing";

  const fwCount = input.fiveWhysCount ?? 0;
  const rcCount = input.rootCauseConclusionsCount ?? 0;
  const c3Status: ValidationCriterion["status"] =
    fwCount >= 1 && rcCount >= 1 ? "ok" : fwCount >= 1 || rcCount >= 1 ? "warning" : "missing";

  const actCount = input.actionsCount ?? 0;
  const actOwnerCount = input.actionsWithOwnerCount ?? 0;
  const c4Status: ValidationCriterion["status"] =
    actCount >= 1 && actOwnerCount === actCount ? "ok" : actCount >= 1 ? "warning" : "missing";

  const hasAfter = Boolean(input.hasAfterComparison);
  const sdcaCount = input.sdcaCheckedCount ?? 0;
  const c5Status: ValidationCriterion["status"] =
    hasAfter && sdcaCount >= 1 ? "ok" : hasAfter || sdcaCount >= 1 ? "warning" : "missing";

  const criteria: ValidationCriterion[] = [
    {
      id: "pdca-goal",
      label: "1. Definición de Meta y GAP (Fase PLAN)",
      detail: hasGoal
        ? `KPI (${input.kpiLabel}) con línea base y meta configuradas`
        : "Falta completar KPI, valor inicial (Desde) o valor meta (A)",
      status: c1Status,
      suggestedScore5: c1Status === "ok" ? 5 : c1Status === "warning" ? 3 : 1,
    },
    {
      id: "pdca-facts",
      label: "2. Estratificación (Pareto/Correlación) e Ishikawa 6M",
      detail: `${ishCount} causa(s) en Ishikawa • Datos de Pareto/Correlación: ${hasFactData ? "Registrados" : "Pendientes"}`,
      status: c2Status,
      suggestedScore5: c2Status === "ok" ? 5 : c2Status === "warning" ? 3 : 1,
    },
    {
      id: "pdca-rc",
      label: "3. Hilo Conductor: 5 Porqués → Conclusiones de Causa Raíz",
      detail: `${fwCount} cadena(s) de 5 Porqués • ${rcCount} conclusión(es) de Causa Raíz`,
      status: c3Status,
      suggestedScore5: c3Status === "ok" ? 5 : c3Status === "warning" ? 3 : 1,
    },
    {
      id: "pdca-do",
      label: "4. Plan de Acción (Fase DO)",
      detail: `${actCount} acción(es) registrada(s) (${actOwnerCount} con responsable asignado)`,
      status: c4Status,
      suggestedScore5: c4Status === "ok" ? 5 : c4Status === "warning" ? 3 : 1,
    },
    {
      id: "pdca-check-act",
      label: "5. Verificación Antes/Después y Estandarización SDCA (CHECK / ACT)",
      detail: `Comparativo Antes/Después: ${hasAfter ? "Sí" : "Pendiente"} • Checkpoints SDCA evaluados: ${sdcaCount}`,
      status: c5Status,
      suggestedScore5: c5Status === "ok" ? 5 : c5Status === "warning" ? 3 : 1,
    },
  ];

  const total = criteria.reduce((sum, c) => sum + c.suggestedScore5, 0);
  const scorePct = Math.round((total / 25) * 100);

  return { criteria, scorePct };
}

interface MethodologyValidatorCardProps {
  title?: string;
  criteria: ValidationCriterion[];
  scorePct: number;
  actionButton?: React.ReactNode;
}

export const MethodologyValidatorCard: React.FC<MethodologyValidatorCardProps> = ({
  title = "Semáforo de Consistencia Metodológica (Pre-Auditoría)",
  criteria,
  scorePct,
  actionButton,
}) => {
  const badgeColor =
    scorePct >= 80
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : scorePct >= 50
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
        : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs print:break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor}`}
          >
            Índice de Consistencia: {scorePct}%
          </span>
          {actionButton}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {criteria.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-border/70 bg-secondary/20 p-2.5 text-xs"
          >
            <div className="flex items-start gap-2">
              {item.status === "ok" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : item.status === "warning" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span className="font-semibold text-foreground leading-snug">{item.label}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
