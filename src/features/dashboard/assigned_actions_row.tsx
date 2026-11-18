/**
 * @fileoverview Row renderer and urgency semaphore badge for unified PDCA/RDA actions.
 */

import { AlertTriangle, Calendar, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { UnifiedActionItem } from "./assigned_actions_helpers";

/** Displays an urgency pill based on remaining days or completion status. */
export function ActionUrgencyBadge({ action_item }: { action_item: UnifiedActionItem }) {
  if (action_item.urgency === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-300">
        <AlertTriangle className="size-3" /> Vencida ({Math.abs(action_item.daysDiff ?? 0)}d)
      </span>
    );
  }
  if (action_item.urgency === "soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
        <Clock className="size-3" />
        {action_item.daysDiff === 0 ? "Vence hoy" : `En ${action_item.daysDiff}d`}
      </span>
    );
  }
  if (action_item.urgency === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-3" /> Completada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
      En tiempo
    </span>
  );
}

interface AssignedActionsRowProps {
  action_item: UnifiedActionItem;
  on_open_project: (action_item: UnifiedActionItem) => void;
}

/** Renders a single unified action commitment row with quick project navigation. */
export function AssignedActionsRow({ action_item, on_open_project }: AssignedActionsRowProps) {
  return (
    <tr className="hover:bg-secondary/40 transition-colors">
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={
              action_item.module === "PDCA"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px]"
                : "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px]"
            }
          >
            {action_item.module}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{action_item.subType}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 max-w-[200px] truncate font-medium text-xs">
        {action_item.projectTitle}
      </td>
      <td className="py-2.5 px-3 max-w-[320px] text-xs font-semibold text-foreground">
        {action_item.description}
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-muted-foreground">
        {action_item.owner}
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3" /> {action_item.deadlineRaw}
        </span>
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap">
        <ActionUrgencyBadge action_item={action_item} />
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => on_open_project(action_item)}
          className="h-7 px-2 text-xs text-primary hover:text-primary"
        >
          Abrir <ExternalLink className="ml-1 size-3" />
        </Button>
      </td>
    </tr>
  );
}
