/**
 * @fileoverview Compact active workload pill strip showing PDCA, RDA, and pending action counts.
 */

import { ClipboardList, FileWarning, FolderKanban } from "lucide-react";
import type { UserWorkloadSummary } from "./user_workload_helpers";

/** Displays three metric badges summarizing active workload for an admin directory user. */
export function AdminUserWorkloadBadges({ workload }: { workload: UserWorkloadSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        title={`${workload.activePdcas} PDCAs activos`}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
          workload.activePdcas > 0
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-secondary/40 text-muted-foreground"
        }`}
      >
        <FolderKanban className="size-3" /> {workload.activePdcas} PDCA
      </span>
      <span
        title={`${workload.activeRdas} RDAs abiertos`}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
          workload.activeRdas > 0
            ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "border-border bg-secondary/40 text-muted-foreground"
        }`}
      >
        <FileWarning className="size-3" /> {workload.activeRdas} RDA
      </span>
      <span
        title={`${workload.pendingActions} acciones pendientes`}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
          workload.pendingActions > 0
            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "border-border bg-secondary/40 text-muted-foreground"
        }`}
      >
        <ClipboardList className="size-3" /> {workload.pendingActions} Acc.
      </span>
    </div>
  );
}
