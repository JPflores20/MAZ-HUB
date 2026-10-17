/**
 * access-request-dialog.tsx
 * Funciones de verificación de permisos de lectura/apertura para el Banco de PDCAs y RDAs,
 * y diálogo modal para que un usuario sin acceso pueda solicitar permiso al Creador,
 * al Responsable o a un Administrador.
 */
import React, { useState, useMemo, useEffect } from "react";
import { Lock, Send, Shield, UserCheck, UserPen, Check } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth, type UserProfile } from "@/context/auth-context";
import type { UserPermissions } from "@/services/user-service";
import { useDirectoryUsers } from "@/components/ui/responsible-profile-card";
import type { Pdca } from "@/data/pdca";
import type { Rda } from "@/data/rda";
import { getRdaDisplayName } from "@/components/RDA/rda-name";

function normalizeStr(val?: string): string {
  return (val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getRdaResponsibles(rda: Rda): string[] {
  const fromContext = (rda.context?.responsable || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromContext.length > 0) return fromContext;
  return (rda.portada?.usuariosAsignados || []).map((s) => s.trim()).filter(Boolean);
}

/**
 * Determina si el usuario actual tiene permiso para abrir el detalle de un PDCA.
 */
export function canUserAccessPdca(
  pdca: Pdca,
  currentUser: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  if (!currentUser) return false;
  if (currentUser.role === "admin" || permissions?.canViewAll) return true;

  const emailLower = normalizeStr(currentUser.email);
  const nameLower = normalizeStr(currentUser.name);
  const userAreaNorm = normalizeStr(currentUser.area);

  if (
    permissions?.canViewArea &&
    userAreaNorm &&
    userAreaNorm !== "usuario" &&
    normalizeStr(pdca.area) === userAreaNorm
  ) {
    return true;
  }

  const isAuthor =
    (Boolean(emailLower) && normalizeStr(pdca.autorEmail) === emailLower) ||
    (Boolean(nameLower) && normalizeStr(pdca.autor) === nameLower);

  if (isAuthor) return true;

  const isAssigned = (pdca.asignados || []).some(
    (a) =>
      (Boolean(emailLower) && normalizeStr(a.email) === emailLower) ||
      (Boolean(nameLower) && normalizeStr(a.name) === nameLower),
  );
  if (isAssigned) return true;

  const isInTeam = (pdca.equipo || []).some((member) => normalizeStr(member) === nameLower);
  if (isInTeam) return true;

  return false;
}

/**
 * Determina si el usuario actual tiene permiso para abrir el detalle de un RDA.
 */
export function canUserAccessRda(
  rda: Rda,
  currentUser: UserProfile | null,
  permissions?: UserPermissions | undefined,
): boolean {
  if (!currentUser) return false;
  if (currentUser.role === "admin" || permissions?.canViewAll) return true;

  const emailLower = normalizeStr(currentUser.email);
  const nameLower = normalizeStr(currentUser.name);
  const userAreaNorm = normalizeStr(currentUser.area);
  const rdaArea = normalizeStr(rda.context?.area || rda.portada?.area);

  if (
    permissions?.canViewArea &&
    userAreaNorm &&
    userAreaNorm !== "usuario" &&
    rdaArea === userAreaNorm
  ) {
    return true;
  }

  const isAuthor =
    (Boolean(emailLower) && normalizeStr(rda.portada?.autorEmail) === emailLower) ||
    (Boolean(nameLower) && normalizeStr(rda.portada?.autorOriginal) === nameLower) ||
    (Boolean(nameLower) && normalizeStr(rda.context?.iniciadoPor) === nameLower);

  if (isAuthor) return true;

  const assigned = getRdaResponsibles(rda).map((p) => normalizeStr(p));
  const isAssigned = assigned.some(
    (person) =>
      (Boolean(nameLower) && (person === nameLower || person.includes(nameLower))) ||
      (Boolean(emailLower) && person === emailLower),
  );

  return isAssigned;
}

export interface AccessRequestTarget {
  module: "PDCA" | "RDA";
  id: string;
  folioOrCode: string;
  title: string;
  area?: string | undefined;
  creatorName?: string | undefined;
  creatorEmail?: string | undefined;
  responsibles: { name: string; email?: string | undefined }[];
}

export function buildPdcaAccessTarget(pdca: Pdca): AccessRequestTarget {
  return {
    module: "PDCA",
    id: pdca.id,
    folioOrCode: pdca.id,
    title: pdca.titulo || `PDCA ${pdca.id}`,
    area: pdca.area,
    creatorName: pdca.autor,
    creatorEmail: pdca.autorEmail,
    responsibles: (pdca.asignados || []).map((a) => ({
      name: a.name,
      email: a.email,
    })),
  };
}

export function buildRdaAccessTarget(rda: Rda): AccessRequestTarget {
  const resps = getRdaResponsibles(rda);
  return {
    module: "RDA",
    id: rda.id,
    folioOrCode: rda.context?.folio || `RDA-${rda.id.slice(-5)}`,
    title: getRdaDisplayName(rda, "Reporte RDA"),
    area: rda.context?.area || rda.portada?.area || rda.context?.planta,
    creatorName: rda.portada?.autorOriginal || rda.context?.iniciadoPor,
    creatorEmail: rda.portada?.autorEmail,
    responsibles: resps.map((name) => ({ name })),
  };
}

interface RecipientOption {
  key: string;
  name: string;
  email?: string | undefined;
  roleLabel: "Creador" | "Responsable" | "Administrador";
}

interface AccessRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AccessRequestTarget | null;
}

export const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  open,
  onOpenChange,
  target,
}) => {
  const { currentUser } = useAuth();
  const { directory, resolveUser } = useDirectoryUsers();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [sending, setSending] = useState(false);

  // Construir lista de destinatarios posibles: Creador, Responsable(s) y Administradores
  const recipientOptions = useMemo<RecipientOption[]>(() => {
    if (!target) return [];
    const map = new Map<string, RecipientOption>();

    const addOption = (
      rawName: string | undefined,
      rawEmail: string | undefined,
      roleLabel: RecipientOption["roleLabel"],
    ) => {
      const cleanName = (rawName || "").trim();
      if (!cleanName || cleanName === "-" || cleanName.toLowerCase() === "sin autor") return;
      const resolved = resolveUser({ name: cleanName, email: rawEmail });
      const finalName = resolved.name || cleanName;
      if (
        currentUser &&
        normalizeStr(finalName) === normalizeStr(currentUser.name)
      ) {
        return;
      }
      const key = normalizeStr(finalName);
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: finalName,
          email: resolved.email || rawEmail,
          roleLabel,
        });
      }
    };

    // 1. Creador
    if (target.creatorName) {
      addOption(target.creatorName, target.creatorEmail, "Creador");
    }

    // 2. Responsables
    for (const r of target.responsibles) {
      addOption(r.name, r.email, "Responsable");
    }

    // 3. Administradores del directorio
    for (const u of directory) {
      if (u.role === "admin") {
        addOption(u.name, u.email, "Administrador");
      }
    }

    // Fallback si no hubiera ningún admin en directory
    if (map.size === 0) {
      map.set("admin-default", {
        key: "admin-default",
        name: "Administrador Global",
        roleLabel: "Administrador",
      });
    }

    return Array.from(map.values());
  }, [target, directory, resolveUser, currentUser]);

  useEffect(() => {
    if (open && recipientOptions.length > 0) {
      // Preseleccionar al Creador y Responsables por defecto, o al primer Admin si no hay
      const primary = recipientOptions
        .filter((r) => r.roleLabel === "Creador" || r.roleLabel === "Responsable")
        .map((r) => r.key);
      if (primary.length > 0) {
        setSelectedKeys(primary);
      } else {
        setSelectedKeys(recipientOptions.slice(0, 1).map((r) => r.key));
      }
      setCustomNote("");
    }
  }, [open, recipientOptions]);

  const toggleRecipient = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSendRequest = async () => {
    if (!target || !currentUser) return;
    const chosen = recipientOptions.filter((r) => selectedKeys.includes(r.key));
    if (chosen.length === 0) {
      toast.warning("Selecciona al menos un destinatario (Creador, Responsable o Administrador).");
      return;
    }

    setSending(true);
    try {
      const noteSuffix = customNote.trim() ? ` — Motivo: "${customNote.trim()}"` : "";
      const baseMessage = `${currentUser.name} solicita permiso para ver el ${target.module} "${target.title}" (${target.folioOrCode})${noteSuffix}`;

      await Promise.all(
        chosen.map((recipient) =>
          addDoc(collection(db, "notifications"), {
            userId: recipient.name,
            type: "access_request",
            module: target.module,
            ...(target.module === "PDCA" ? { pdcaId: target.id } : { rdaId: target.id }),
            pdcaTitle: `${target.module}: ${target.title}`,
            actionId: `access-req-${target.id}-${currentUser.uid}`,
            requesterUid: currentUser.uid,
            requesterName: currentUser.name,
            requesterEmail: currentUser.email,
            message: baseMessage,
            read: false,
            createdAt: new Date().toISOString(),
          }),
        ),
      );

      toast.success(
        `Solicitud enviada a ${chosen.map((c) => c.name).join(", ")}. Recibirás acceso cuando la aprueben.`,
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error al enviar solicitud de acceso:", error);
      toast.error("No se pudo enviar la solicitud de permiso. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Lock className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Acceso Restringido · Solicitar Permiso
              </DialogTitle>
              <DialogDescription className="text-xs">
                No estás asignado a este {target.module}. Solicita acceso para poder abrirlo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumen del documento bloqueado */}
          <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="font-mono text-[10px] font-bold">
                {target.folioOrCode}
              </Badge>
              {target.area && (
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {target.area}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-foreground">{target.title}</p>
          </div>

          {/* Selección de destinatarios */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Enviar solicitud a:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {recipientOptions.map((opt) => {
                const isSelected = selectedKeys.includes(opt.key);
                const roleBadgeClass =
                  opt.roleLabel === "Creador"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : opt.roleLabel === "Responsable"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
                const RoleIcon =
                  opt.roleLabel === "Creador"
                    ? UserPen
                    : opt.roleLabel === "Responsable"
                      ? UserCheck
                      : Shield;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleRecipient(opt.key)}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-xs"
                        : "border-border bg-background hover:bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-foreground truncate">
                          {opt.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${roleBadgeClass}`}
                        >
                          <RoleIcon className="size-2.5" />
                          {opt.roleLabel}
                        </span>
                      </div>
                      {opt.email && !opt.email.endsWith("@colaborador.local") && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {opt.email}
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivo opcional */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Mensaje o motivo (opcional)
            </label>
            <Textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ej. Necesito consultar el análisis de causa raíz para replicarlo en mi línea..."
              className="min-h-[64px] text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSendRequest()}
            disabled={sending || selectedKeys.length === 0}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            {sending ? "Enviando..." : "Solicitar Permiso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
