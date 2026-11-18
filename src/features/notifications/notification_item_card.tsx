/**
 * @fileoverview Single notification item card with inline access-request approve/reject actions.
 */

import type React from "react";
import { Check, ExternalLink, Lock, ShieldCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/shared/ui/button";
import type { AppNotification } from "./notification_types";

interface NotificationItemCardProps {
  notification: AppNotification;
  approving_id: string | null;
  on_click: (notification: AppNotification) => void;
  on_approve: (click_event: React.MouseEvent, notification: AppNotification) => void;
  on_reject: (click_event: React.MouseEvent, notification: AppNotification) => void;
}

/** Renders an interactive notification item row inside the notification bell dropdown. */
export function NotificationItemCard({
  notification,
  approving_id,
  on_click,
  on_approve,
  on_reject,
}: NotificationItemCardProps) {
  const is_access_request =
    notification.type === "access_request" && Boolean(notification.requesterName);
  const is_pending_request =
    is_access_request && !notification.approved && !notification.rejected;

  return (
    <div
      className={`flex flex-col gap-1.5 p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
        is_pending_request
          ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-500"
          : !notification.read
            ? "bg-muted/30"
            : ""
      }`}
      onClick={() => on_click(notification)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2">
          {is_access_request && (
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Lock className="size-3.5" />
            </div>
          )}
          <span className="font-medium text-xs leading-snug">{notification.message}</span>
        </div>
        {!notification.read && (
          <span className="flex-shrink-0 h-2 w-2 mt-1.5 rounded-full bg-blue-600" />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground truncate">
          {notification.pdcaTitle || "N/A"}
        </span>
        {(notification.pdcaId || notification.rdaId) && (
          <ExternalLink className="size-3 shrink-0 text-primary" />
        )}
      </div>

      {is_access_request && (
        <div className="pt-1.5 flex items-center justify-between gap-2">
          {notification.approved ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Check className="size-3" /> Acceso aprobado
            </span>
          ) : notification.rejected ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              Solicitud descartada
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                disabled={approving_id === notification.id}
                onClick={(click_event) => on_approve(click_event, notification)}
                className="h-7 px-2.5 text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ShieldCheck className="size-3.5" />
                {approving_id === notification.id
                  ? "Aprobando..."
                  : `Dar acceso a ${notification.requesterName}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={approving_id === notification.id}
                onClick={(click_event) => on_reject(click_event, notification)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                title="Descartar solicitud"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      <span className="text-[10px] text-muted-foreground">
        {formatDistanceToNow(new Date(notification.createdAt || new Date()), {
          addSuffix: true,
          locale: es,
        })}
      </span>
    </div>
  );
}
