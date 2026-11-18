/**
 * @fileoverview Modal dialog allowing users without permission to request access to a PDCA or RDA.
 * Allows selecting creators, assigned responsibles, and administrators as request recipients.
 */

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth_context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import {
  build_access_recipient_options,
  send_access_request_notifications,
  type RecipientOption,
} from "./access_request_service";
import type { AccessRequestTarget } from "./access_target_builders";
import { AccessRequestRecipientsList } from "./access_request_recipients_list";

/** Props accepted by AccessRequestDialog. */
export interface AccessRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AccessRequestTarget | null;
}

/**
 * Interactive modal enabling restricted users to submit access-request notifications.
 *
 * @param {AccessRequestDialogProps} props - Open state, handler, and restricted document descriptor.
 * @returns {React.ReactElement | null} Rendered modal or null when no target is selected.
 */
export const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  open,
  onOpenChange,
  target,
}) => {
  const { currentUser } = useAuth();
  const { directory, resolve_user } = useDirectoryUsers();
  const [selected_keys, set_selected_keys] = useState<string[]>([]);
  const [custom_note, set_custom_note] = useState("");
  const [is_sending, set_is_sending] = useState(false);

  const recipient_options = useMemo<RecipientOption[]>(
    () => build_access_recipient_options(target, directory, resolve_user, currentUser),
    [target, directory, resolve_user, currentUser],
  );

  useEffect(() => {
    if (open && recipient_options.length > 0) {
      set_selected_keys(recipient_options.map((recipient_entry) => recipient_entry.key));
      set_custom_note("");
    }
  }, [open, recipient_options]);

  const toggle_recipient = (recipient_key: string) => {
    set_selected_keys((previous_keys) =>
      previous_keys.includes(recipient_key)
        ? previous_keys.filter((existing_key) => existing_key !== recipient_key)
        : [...previous_keys, recipient_key],
    );
  };

  const handle_send_request = async () => {
    if (!target || !currentUser) {
      return;
    }
    const chosen_recipients = recipient_options.filter((recipient_entry) =>
      selected_keys.includes(recipient_entry.key),
    );
    if (chosen_recipients.length === 0) {
      toast.warning("Selecciona al menos un destinatario (Creador, Responsable o Administrador).");
      return;
    }

    set_is_sending(true);
    try {
      await send_access_request_notifications({
        target,
        current_user: currentUser,
        chosen_recipients,
        custom_note,
      });
      toast.success(
        `Solicitud enviada a ${chosen_recipients.map((recipient_entry) => recipient_entry.name).join(", ")}. Recibirás una notificación cuando la aprueben.`,
      );
      onOpenChange(false);
    } catch (request_error) {
      console.error("Error al enviar solicitud de acceso:", request_error);
      toast.error("No se pudo enviar la solicitud de permiso. Intenta nuevamente.");
    } finally {
      set_is_sending(false);
    }
  };

  if (!target) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-border bg-card shadow-2xl"
        onClick={(click_event) => click_event.stopPropagation()}
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

          <AccessRequestRecipientsList
            recipientOptions={recipient_options}
            selectedKeys={selected_keys}
            onToggleRecipient={toggle_recipient}
          />

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Mensaje o motivo (opcional)
            </label>
            <Textarea
              value={custom_note}
              onChange={(change_event) => set_custom_note(change_event.target.value)}
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
            disabled={is_sending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handle_send_request()}
            disabled={is_sending || selected_keys.length === 0}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            {is_sending ? "Enviando..." : "Solicitar Permiso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
