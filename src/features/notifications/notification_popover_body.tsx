/**
 * @fileoverview Lazy-loaded notification popover body rendering ScrollArea, unread controls, and date-formatted items.
 */

import type React from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll_area";
import { NotificationItemCard } from "./notification_item_card";
import type { AppNotification } from "./notification_types";

interface NotificationPopoverBodyProps {
  notifications: AppNotification[];
  unread_count: number;
  pending_access_requests: AppNotification[];
  approving_id: string | null;
  mark_all_as_read: () => Promise<void>;
  handle_approve_access: (
    click_event: React.MouseEvent,
    notification: AppNotification,
  ) => Promise<void>;
  handle_reject_access: (
    click_event: React.MouseEvent,
    notification: AppNotification,
  ) => Promise<void>;
  handle_notification_click: (notification: AppNotification) => void;
}

/** Displays header actions and scrollable notification list when the notification bell popover opens. */
export function NotificationPopoverBody({
  notifications,
  unread_count,
  pending_access_requests,
  approving_id,
  mark_all_as_read,
  handle_approve_access,
  handle_reject_access,
  handle_notification_click,
}: NotificationPopoverBodyProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {pending_access_requests.length > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold"
            >
              {pending_access_requests.length} permiso(s)
            </Badge>
          )}
        </div>
        {unread_count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void mark_all_as_read()}
            className="text-xs h-auto py-1 px-2"
          >
            Marcar todas leídas
          </Button>
        )}
      </div>

      <ScrollArea className="h-[360px]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No tienes notificaciones ni solicitudes pendientes
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItemCard
                key={notification.id}
                notification={notification}
                approving_id={approving_id}
                on_click={handle_notification_click}
                on_approve={(click_event, target_notification) =>
                  void handle_approve_access(click_event, target_notification)
                }
                on_reject={(click_event, target_notification) =>
                  void handle_reject_access(click_event, target_notification)
                }
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
