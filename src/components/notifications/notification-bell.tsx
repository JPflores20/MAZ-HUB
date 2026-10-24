/**
 * notification-bell.tsx
 * Campana de notificaciones en tiempo real con alertas visibles de solicitudes de permiso (PDCA y RDA),
 * detección inteligente para Administradores y Dueños/Responsables del documento, y aprobación en 1 clic.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ExternalLink, Lock, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  writeBatch,
  addDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/auth/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { updatePdcaAssignedUsers } from "@/services/pdca-service";
import { updateRda } from "@/services/rda-service";
import { defaultRda } from "@/data/rda";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  relatedDocIds?: string[] | undefined;
  userId: string;
  recipientEmail?: string | undefined;
  recipientRole?: string | undefined;
  forAdmins?: boolean | undefined;
  creatorName?: string | undefined;
  creatorEmail?: string | undefined;
  responsibleNames?: string[] | undefined;
  responsibleEmails?: string[] | undefined;
  type?: string | undefined;
  module?: "PDCA" | "RDA" | undefined;
  folioOrCode?: string | undefined;
  pdcaId?: string | undefined;
  rdaId?: string | undefined;
  pdcaTitle: string;
  actionId: string;
  requesterUid?: string | undefined;
  requesterName?: string | undefined;
  requesterEmail?: string | undefined;
  customNote?: string | undefined;
  approved?: boolean | undefined;
  rejected?: boolean | undefined;
  message: string;
  read: boolean;
  createdAt: string;
}

const MAX_NOTIFICATIONS = 35;

function normalizeStr(val?: string | null): string {
  return (val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function NotificationBell() {
  const { currentUser, permissions } = useAuth();
  const { allPdcas, refresh: refreshPdcas } = usePdcas();
  const { allRdas, refresh: refreshRdas, updateRdaInCache } = useRdas();
  const navigate = useNavigate();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const alertedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) {
      setRawNotifications([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const docs: Notification[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
        });
        setRawNotifications(docs);
      },
      (error) => {
        console.error("Error escuchando notificaciones en tiempo real:", error);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Filtrar y deduplicar notificaciones relevantes para el usuario actual (Dueño, Responsable o Admin)
  const notifications = useMemo<Notification[]>(() => {
    if (!currentUser) return [];

    const userNormName = normalizeStr(currentUser.name);
    const userNormEmail = normalizeStr(currentUser.email);
    const isAdmin =
      currentUser.role === "admin" ||
      Boolean(permissions?.canManageUsers) ||
      Boolean(permissions?.canViewAll);

    const isForCurrentUser = (n: Notification): boolean => {
      const notifUserNorm = normalizeStr(n.userId);
      const notifEmailNorm = normalizeStr(n.recipientEmail);

      // 1. Coincidencia directa por nombre o correo del destinatario
      if (userNormName && notifUserNorm === userNormName) return true;
      if (userNormEmail && notifEmailNorm && notifEmailNorm === userNormEmail) return true;

      // 2. Si es confirmación de acceso aprobado para el solicitante
      if (n.type === "access_approved" || n.type === "access_rejected") {
        if (n.requesterUid && n.requesterUid === currentUser.uid) return true;
        if (userNormEmail && normalizeStr(n.requesterEmail) === userNormEmail) return true;
        if (userNormName && normalizeStr(n.requesterName) === userNormName) return true;
      }

      // 3. Si es una solicitud de permiso (access_request), verificar si el usuario actual
      //    es Administrador o es el Dueño/Creador/Responsable del PDCA o RDA
      if (n.type === "access_request") {
        // No mostrar la solicitud como pendiente de aprobar al propio solicitante
        const isSelfRequester =
          (Boolean(n.requesterUid) && n.requesterUid === currentUser.uid) ||
          (Boolean(userNormEmail) && normalizeStr(n.requesterEmail) === userNormEmail) ||
          (Boolean(userNormName) && normalizeStr(n.requesterName) === userNormName);

        if (isSelfRequester) return false;

        // Todo Administrador recibe todas las solicitudes de acceso a PDCAs y RDAs
        if (isAdmin) return true;

        // Verificar metadatos guardados en la notificación
        if (userNormName && normalizeStr(n.creatorName) === userNormName) return true;
        if (userNormEmail && normalizeStr(n.creatorEmail) === userNormEmail) return true;
        if (
          userNormName &&
          (n.responsibleNames || []).some((r) => normalizeStr(r) === userNormName)
        ) {
          return true;
        }
        if (
          userNormEmail &&
          (n.responsibleEmails || []).some((e) => normalizeStr(e) === userNormEmail)
        ) {
          return true;
        }

        // Verificar contra el documento PDCA en vivo
        if (n.pdcaId) {
          const pdca = allPdcas.find((p) => p.id === n.pdcaId);
          if (pdca) {
            const isPdcaOwner =
              (Boolean(userNormEmail) && normalizeStr(pdca.autorEmail) === userNormEmail) ||
              (Boolean(userNormName) && normalizeStr(pdca.autor) === userNormName);
            const isPdcaAssigned =
              (pdca.asignados || []).some(
                (a) =>
                  (Boolean(userNormEmail) && normalizeStr(a.email) === userNormEmail) ||
                  (Boolean(userNormName) && normalizeStr(a.name) === userNormName),
              ) || (pdca.equipo || []).some((m) => normalizeStr(m) === userNormName);

            if (isPdcaOwner || isPdcaAssigned) return true;
          }
        }

        // Verificar contra el documento RDA en vivo
        if (n.rdaId) {
          const rda = allRdas.find((r) => r.id === n.rdaId);
          if (rda) {
            const isRdaOwner =
              (Boolean(userNormEmail) && normalizeStr(rda.portada?.autorEmail) === userNormEmail) ||
              (Boolean(userNormName) &&
                normalizeStr(rda.portada?.autorOriginal) === userNormName) ||
              (Boolean(userNormName) && normalizeStr(rda.context?.iniciadoPor) === userNormName);

            const rdaResps = [
              ...(rda.context?.responsable || "").split(",").map((s) => s.trim()),
              ...(rda.portada?.usuariosAsignados || []),
            ]
              .filter(Boolean)
              .map((s) => normalizeStr(s));

            const isRdaAssigned = rdaResps.some(
              (person) =>
                (Boolean(userNormName) &&
                  (person === userNormName || person.includes(userNormName))) ||
                (Boolean(userNormEmail) && person === userNormEmail),
            );

            if (isRdaOwner || isRdaAssigned) return true;
          }
        }
      }

      return false;
    };

    const matched = rawNotifications.filter(isForCurrentUser);

    // Agrupar solicitudes de acceso duplicadas (cuando se enviaron a múltiples destinatarios)
    const groupedMap = new Map<string, Notification>();
    for (const item of matched) {
      const groupKey =
        item.type === "access_request"
          ? item.actionId ||
            `access-req-${item.pdcaId || item.rdaId || ""}-${item.requesterUid || normalizeStr(item.requesterName)}`
          : item.id;

      const existing = groupedMap.get(groupKey);
      if (!existing) {
        groupedMap.set(groupKey, {
          ...item,
          relatedDocIds: [item.id],
        });
      } else {
        const mergedIds = Array.from(new Set([...(existing.relatedDocIds || [existing.id]), item.id]));
        const isDirectMatch = normalizeStr(item.userId) === userNormName;
        const base = isDirectMatch ? item : existing;
        const anyApproved = Boolean(existing.approved || item.approved);
        const anyRejected = Boolean(existing.rejected || item.rejected);
        const allRead = Boolean((existing.read && item.read) || anyApproved || anyRejected);

        groupedMap.set(groupKey, {
          ...base,
          relatedDocIds: mergedIds,
          approved: anyApproved,
          rejected: anyRejected,
          read: allRead,
        });
      }
    }

    const result = Array.from(groupedMap.values());
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result.slice(0, MAX_NOTIFICATIONS);
  }, [rawNotifications, currentUser, permissions, allPdcas, allRdas]);

  // Disparar alerta emergente (Toast) en tiempo real cuando llega una solicitud de acceso o una aprobación
  useEffect(() => {
    if (!currentUser || notifications.length === 0) return;

    for (const notif of notifications) {
      const alertKey = `${notif.actionId || notif.id}-${notif.type || "msg"}`;
      if (alertedIdsRef.current.has(alertKey)) continue;

      if (
        notif.type === "access_request" &&
        !notif.approved &&
        !notif.rejected &&
        !notif.read
      ) {
        alertedIdsRef.current.add(alertKey);
        const modLabel = notif.module || (notif.rdaId ? "RDA" : "PDCA");
        toast.warning(`Solicitud de permiso (${modLabel})`, {
          description: `${notif.requesterName || "Un usuario"} solicita acceso a "${notif.pdcaTitle}".`,
          duration: 10000,
          action: {
            label: "Revisar / Aprobar",
            onClick: () => setIsOpen(true),
          },
        });
      } else if (notif.type === "access_approved" && !notif.read) {
        alertedIdsRef.current.add(alertKey);
        toast.success("Permiso de acceso concedido", {
          description: notif.message,
          duration: 8000,
        });
        void refreshPdcas();
        void refreshRdas();
      }
    }
  }, [notifications, currentUser, refreshPdcas, refreshRdas]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingAccessRequests = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.type === "access_request" &&
          Boolean(n.requesterName) &&
          !n.approved &&
          !n.rejected,
      ),
    [notifications],
  );

  const markAsRead = async (notif: Notification) => {
    try {
      const ids = notif.relatedDocIds && notif.relatedDocIds.length > 0 ? notif.relatedDocIds : [notif.id];
      const batch = writeBatch(db);
      ids.forEach((docId) => {
        batch.update(doc(db, "notifications", docId), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.read);
    if (unreadNotifs.length === 0) return;
    try {
      const batch = writeBatch(db);
      unreadNotifs.forEach((notif) => {
        const ids =
          notif.relatedDocIds && notif.relatedDocIds.length > 0
            ? notif.relatedDocIds
            : [notif.id];
        ids.forEach((docId) => {
          batch.update(doc(db, "notifications", docId), { read: true });
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleApproveAccess = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    if (!notif.requesterName || !currentUser) return;

    setApprovingId(notif.id);
    try {
      const reqName = notif.requesterName.trim();
      const reqEmail = (notif.requesterEmail || "").trim();

      if (notif.pdcaId) {
        const pdca = allPdcas.find((p) => p.id === notif.pdcaId);
        if (!pdca) {
          toast.error("No se encontró el PDCA solicitado.");
          return;
        }
        const currentAssigned = pdca.asignados || [];
        const alreadyAssigned = currentAssigned.some(
          (a) =>
            (reqEmail && a.email.toLowerCase() === reqEmail.toLowerCase()) ||
            a.name.toLowerCase() === reqName.toLowerCase(),
        );
        if (!alreadyAssigned) {
          await updatePdcaAssignedUsers(pdca.id, [
            ...currentAssigned,
            { name: reqName, email: reqEmail },
          ]);
          await refreshPdcas();
        }
      } else if (notif.rdaId) {
        const rda = allRdas.find((r) => r.id === notif.rdaId);
        if (!rda) {
          toast.error("No se encontró el RDA solicitado.");
          return;
        }
        const fromContext = (rda.context?.responsable || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const currentList =
          fromContext.length > 0
            ? fromContext
            : (rda.portada?.usuariosAsignados || []).map((s) => s.trim()).filter(Boolean);

        const alreadyAssigned = currentList.some(
          (p) => p.toLowerCase() === reqName.toLowerCase(),
        );
        if (!alreadyAssigned) {
          const nextList = [...currentList, reqName];
          const saved = await updateRda({
            ...rda,
            context: {
              ...rda.context,
              responsable: nextList.join(", "),
            },
            portada: {
              ...(rda.portada || defaultRda.portada!),
              usuariosAsignados: nextList,
            },
          });
          updateRdaInCache(saved);
          await refreshRdas();
        }
      }

      const ids =
        notif.relatedDocIds && notif.relatedDocIds.length > 0
          ? notif.relatedDocIds
          : [notif.id];
      const batch = writeBatch(db);
      ids.forEach((docId) => {
        batch.update(doc(db, "notifications", docId), {
          read: true,
          approved: true,
        });
      });
      await batch.commit();

      await addDoc(collection(db, "notifications"), {
        userId: reqName,
        recipientEmail: reqEmail,
        requesterUid: notif.requesterUid || "",
        requesterName: reqName,
        requesterEmail: reqEmail,
        type: "access_approved",
        ...(notif.pdcaId ? { pdcaId: notif.pdcaId } : {}),
        ...(notif.rdaId ? { rdaId: notif.rdaId } : {}),
        pdcaTitle: notif.pdcaTitle,
        actionId: `access-ok-${notif.id}`,
        message: `${currentUser.name} aprobó tu solicitud de acceso para "${notif.pdcaTitle}". Ya puedes abrirlo.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      toast.success(`Acceso concedido a ${reqName}.`);
    } catch (error) {
      console.error("Error aprobando solicitud de acceso:", error);
      toast.error("No se pudo otorgar el acceso. Intenta nuevamente.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectAccess = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    if (!currentUser) return;

    setApprovingId(notif.id);
    try {
      const ids =
        notif.relatedDocIds && notif.relatedDocIds.length > 0
          ? notif.relatedDocIds
          : [notif.id];
      const batch = writeBatch(db);
      ids.forEach((docId) => {
        batch.update(doc(db, "notifications", docId), {
          read: true,
          rejected: true,
        });
      });
      await batch.commit();
      toast.info(`Solicitud de ${notif.requesterName || "usuario"} descartada.`);
    } catch (error) {
      console.error("Error al descartar solicitud de acceso:", error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      void markAsRead(notification);
    }
    setIsOpen(false);
    try {
      if (notification.rdaId) {
        sessionStorage.setItem("maz_hub_open_rda_id", notification.rdaId);
        void navigate({ to: "/rda" });
      } else if (notification.pdcaId) {
        sessionStorage.setItem("maz_hub_open_pdca_id", notification.pdcaId);
        void navigate({ to: "/" });
      }
    } catch {
      // Ignorar errores de navegación
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-1.5">
        {pendingAccessRequests.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Tienes solicitudes de permiso pendientes de aprobar"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-200 shadow-sm transition-all cursor-pointer animate-pulse"
          >
            <Lock className="size-3.5 text-amber-300" />
            <span>
              {pendingAccessRequests.length}{" "}
              {pendingAccessRequests.length === 1
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 dark:bg-red-600 px-1 text-[11px] font-bold text-white shadow-md">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-80 sm:w-[400px] p-0 rounded-2xl overflow-hidden shadow-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {pendingAccessRequests.length > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold"
              >
                {pendingAccessRequests.length} permiso(s)
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void markAllAsRead()}
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
              {notifications.map((notification) => {
                const isAccessRequest =
                  notification.type === "access_request" && Boolean(notification.requesterName);
                const isPendingRequest =
                  isAccessRequest && !notification.approved && !notification.rejected;

                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-1.5 p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                      isPendingRequest
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-500"
                        : !notification.read
                          ? "bg-muted/30"
                          : ""
                    }`}
                    onClick={() => void handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2">
                        {isAccessRequest && (
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <Lock className="size-3.5" />
                          </div>
                        )}
                        <span className="font-medium text-xs leading-snug">
                          {notification.message}
                        </span>
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

                    {isAccessRequest && (
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
                              disabled={approvingId === notification.id}
                              onClick={(e) => void handleApproveAccess(e, notification)}
                              className="h-7 px-2.5 text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <ShieldCheck className="size-3.5" />
                              {approvingId === notification.id
                                ? "Aprobando..."
                                : `Dar acceso a ${notification.requesterName}`}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={approvingId === notification.id}
                              onClick={(e) => void handleRejectAccess(e, notification)}
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
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

