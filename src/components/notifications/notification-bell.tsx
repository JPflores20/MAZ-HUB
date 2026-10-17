/**
 * notification-bell.tsx
 * Campana de notificaciones en tiempo real con alertas de tareas próximas a vencer, asignaciones
 * y aprobación en 1 clic de solicitudes de acceso a PDCAs y RDAs.
 */
import React, { useEffect, useState } from "react";
import { Bell, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  updateDoc,
  writeBatch,
  addDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { updatePdcaAssignedUsers } from "@/services/pdca-service";
import { updateRda } from "@/services/rda-service";
import { defaultRda } from "@/data/rda";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  userId: string;
  type?: string | undefined;
  module?: "PDCA" | "RDA" | undefined;
  pdcaId?: string | undefined;
  rdaId?: string | undefined;
  pdcaTitle: string;
  actionId: string;
  requesterUid?: string | undefined;
  requesterName?: string | undefined;
  requesterEmail?: string | undefined;
  approved?: boolean | undefined;
  message: string;
  read: boolean;
  createdAt: string;
}

const MAX_NOTIFICATIONS = 25;

export function NotificationBell() {
  const { currentUser } = useAuth();
  const { allPdcas, refresh: refreshPdcas } = usePdcas();
  const { allRdas, updateRdaInCache } = useRdas();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.name) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.name),
      limit(MAX_NOTIFICATIONS),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
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
        batch.update(doc(db, "notifications", notif.id), { read: true });
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
        }
      }

      await updateDoc(doc(db, "notifications", notif.id), {
        read: true,
        approved: true,
      });

      await addDoc(collection(db, "notifications"), {
        userId: reqName,
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      void markAsRead(notification.id);
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
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto py-1 px-2"
            >
              Marcar todas leídas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[340px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const isAccessRequest =
                  notification.type === "access_request" && Boolean(notification.requesterName);
                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-1.5 p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                    onClick={() => void handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-xs leading-snug line-clamp-3">
                        {notification.message}
                      </span>
                      {!notification.read && (
                        <span className="flex-shrink-0 h-2 w-2 mt-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {notification.pdcaTitle || "N/A"}
                      </span>
                      {(notification.pdcaId || notification.rdaId) && (
                        <ExternalLink className="size-3 shrink-0 text-primary" />
                      )}
                    </div>

                    {isAccessRequest && (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        {notification.approved ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" /> Acceso aprobado
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={approvingId === notification.id}
                            onClick={(e) => void handleApproveAccess(e, notification)}
                            className="h-7 px-2.5 text-[11px] font-semibold gap-1"
                          >
                            <ShieldCheck className="size-3.5" />
                            {approvingId === notification.id
                              ? "Aprobando..."
                              : `Dar acceso a ${notification.requesterName}`}
                          </Button>
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
