/**
 * @fileoverview Custom hook managing realtime notification state, live alert toasts, and access request actions.
 */

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth_context";
import { user_service } from "@/features/auth/user_service";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  collect_related_notification_ids,
  mark_notifications_read,
  subscribe_to_notifications,
} from "./notification_firestore_service";
import { group_and_sort_notifications } from "./notification_grouping";
import type { AppNotification } from "./notification_types";

/** Coordinates notification subscription, real-time alert toasts, and 1-click access approvals. */
export function useNotificationsFeed() {
  const { currentUser } = useAuth();
  const { allPdcas, refresh: refresh_pdcas } = usePdcas();
  const { allRdas, refresh: refresh_rdas } = useRdas();
  const navigate = useNavigate();

  const [raw_notifications, set_raw_notifications] = useState<AppNotification[]>([]);
  const [is_open, set_is_open] = useState(false);
  const [approving_id, set_approving_id] = useState<string | null>(null);
  const alerted_keys_ref = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) {
      set_raw_notifications([]);
      return undefined;
    }
    return subscribe_to_notifications(currentUser, set_raw_notifications);
  }, [currentUser]);

  const notifications = useMemo<AppNotification[]>(() => {
    if (!currentUser) return [];
    return group_and_sort_notifications(raw_notifications, currentUser, allPdcas, allRdas);
  }, [raw_notifications, currentUser, allPdcas, allRdas]);

  useEffect(() => {
    if (!currentUser || notifications.length === 0) return;

    for (const notification of notifications) {
      const alert_key = `${notification.actionId || notification.id}-${notification.type || "msg"}`;
      if (alerted_keys_ref.current.has(alert_key)) continue;

      if (
        notification.type === "access_request" &&
        !notification.approved &&
        !notification.rejected &&
        !notification.read
      ) {
        alerted_keys_ref.current.add(alert_key);
        const module_label = notification.module || (notification.rdaId ? "RDA" : "PDCA");
        toast.warning(`Solicitud de permiso (${module_label})`, {
          description: `${notification.requesterName || "Un usuario"} solicita acceso a "${notification.pdcaTitle}".`,
          duration: 10000,
          action: { label: "Revisar / Aprobar", onClick: () => set_is_open(true) },
        });
      } else if (notification.type === "access_approved" && !notification.read) {
        alerted_keys_ref.current.add(alert_key);
        toast.success("Permiso de acceso concedido", {
          description: notification.message,
          duration: 8000,
        });
        void refresh_pdcas();
        void refresh_rdas();
      }
    }
  }, [notifications, currentUser, refresh_pdcas, refresh_rdas]);

  const unread_count = notifications.filter((notification) => !notification.read).length;
  const pending_access_requests = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.type === "access_request" &&
          Boolean(notification.requesterName) &&
          !notification.approved &&
          !notification.rejected,
      ),
    [notifications],
  );

  const mark_all_as_read = () =>
    mark_notifications_read(notifications.filter((notification) => !notification.read));

  const handle_approve_access = async (
    click_event: React.MouseEvent,
    notification: AppNotification,
  ) => {
    click_event.stopPropagation();
    if (!notification.requesterName || !currentUser) return;
    set_approving_id(notification.id);
    try {
      const result = await user_service.approve_access_request(
        notification.id,
        collect_related_notification_ids(notification),
      );
      if (result.module === "PDCA") {
        await refresh_pdcas();
      } else {
        await refresh_rdas();
      }
      toast.success(`Acceso concedido a ${notification.requesterName.trim()}.`);
    } catch (approve_error) {
      console.error("Error aprobando solicitud de acceso:", approve_error);
      toast.error("No se pudo otorgar el acceso. Verifica tus permisos o intenta nuevamente.");
    } finally {
      set_approving_id(null);
    }
  };

  const handle_reject_access = async (
    click_event: React.MouseEvent,
    notification: AppNotification,
  ) => {
    click_event.stopPropagation();
    if (!currentUser) return;
    set_approving_id(notification.id);
    try {
      await user_service.reject_access_request(
        notification.id,
        collect_related_notification_ids(notification),
      );
      toast.info(`Solicitud de ${notification.requesterName || "usuario"} descartada.`);
    } catch (reject_error) {
      console.error("Error al descartar solicitud de acceso:", reject_error);
      toast.error("No se pudo descartar la solicitud. Verifica tus permisos.");
    } finally {
      set_approving_id(null);
    }
  };

  const handle_notification_click = (notification: AppNotification) => {
    if (!notification.read) {
      void mark_notifications_read([notification]);
    }
    set_is_open(false);
    try {
      if (notification.rdaId) {
        sessionStorage.setItem("maz_hub_open_rda_id", notification.rdaId);
        void navigate({ to: "/rda" });
      } else if (notification.pdcaId) {
        sessionStorage.setItem("maz_hub_open_pdca_id", notification.pdcaId);
        void navigate({ to: "/" });
      }
    } catch {
      // Ignore storage errors
    }
  };

  return {
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
  };
}
