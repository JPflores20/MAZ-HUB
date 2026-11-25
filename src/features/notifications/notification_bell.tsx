/**
 * @fileoverview Header notification bell button and access-request pill alert with lazy-loaded popover content.
 */

import { lazy, Suspense } from "react";
import { Bell, Lock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useNotificationsFeed } from "./use_notifications_feed";

const LazyNotificationPopoverBody = lazy(() =>
  import("./notification_popover_body").then((module) => ({
    default: module.NotificationPopoverBody,
  })),
);

/** Displays the top-bar notification bell and approval dropdown for PDCA/RDA permissions. */
export function NotificationBell() {
  const {
    notifications,
    unread_count,
    pending_access_requests,
    is_open,
    set_is_open,
    approving_id,
    mark_all_as_read,
    handle_approve_access,
    handle_reject_access,
    handle_notification_click,
  } = useNotificationsFeed();

  return (
    <Popover open={is_open} onOpenChange={set_is_open}>
      <div className="flex items-center gap-1.5">
        {pending_access_requests.length > 0 && (
          <button
            type="button"
            onClick={() => set_is_open(true)}
            title="Tienes solicitudes de permiso pendientes de aprobar"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-200 shadow-sm transition-all cursor-pointer animate-pulse"
          >
            <Lock className="size-3.5 text-amber-300" />
            <span>
              {pending_access_requests.length}{" "}
              {pending_access_requests.length === 1
                ? "Solicitud de acceso"
                : "Solicitudes de acceso"}
            </span>
          </button>
        )}

        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-blue-200/80 hover:bg-white/10 hover:text-white"
            title="Notificaciones y Solicitudes de Permiso"
          >
            <Bell className="size-5" />
            {unread_count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 dark:bg-red-600 px-1 text-[11px] font-bold text-white shadow-md">
                {unread_count}
              </span>
            )}
          </Button>
        </PopoverTrigger>
      </div>

      {is_open && (
        <PopoverContent
          className="w-80 sm:w-[400px] p-0 rounded-2xl overflow-hidden shadow-2xl"
          align="end"
        >
          <Suspense
            fallback={
              <div className="p-6 text-center text-xs text-muted-foreground">
                Cargando notificaciones...
              </div>
            }
          >
            <LazyNotificationPopoverBody
              notifications={notifications}
              unread_count={unread_count}
              pending_access_requests={pending_access_requests}
              approving_id={approving_id}
              mark_all_as_read={mark_all_as_read}
              handle_approve_access={handle_approve_access}
              handle_reject_access={handle_reject_access}
              handle_notification_click={handle_notification_click}
            />
          </Suspense>
        </PopoverContent>
      )}
    </Popover>
  );
}
