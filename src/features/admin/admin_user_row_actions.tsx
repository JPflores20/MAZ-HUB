/**
 * @fileoverview Row action controls for activation link dispatch, approval, profile edit, and confirmed deletion.
 */

import { CheckCircle2, Loader2, Pencil, Send, Trash2 } from "lucide-react";
import type { UserProfile } from "@/features/auth/auth_context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert_dialog";
import { Button } from "@/shared/ui/button";
import { AdminUserExtendPopover } from "./admin_user_extend_popover";

interface AdminUserRowActionsProps {
  user_profile: UserProfile;
  is_sending_link: boolean;
  is_approving: boolean;
  can_receive_link: boolean;
  needs_admin_verification: boolean;
  can_extend_intern: boolean;
  on_send_verification_link: (user_profile: UserProfile) => Promise<void>;
  on_approve_user: (user_profile: UserProfile) => Promise<void>;
  on_extend_intern_days: (user_profile: UserProfile, active_days: number) => Promise<void>;
  on_edit_user: (uid: string) => void;
  on_delete_user: (uid: string, name: string) => Promise<void>;
}

/** Renders administrative icon buttons and deletion confirmation dialog for a single user row. */
export function AdminUserRowActions({
  user_profile,
  is_sending_link,
  is_approving,
  can_receive_link,
  needs_admin_verification,
  can_extend_intern,
  on_send_verification_link,
  on_approve_user,
  on_extend_intern_days,
  on_edit_user,
  on_delete_user,
}: AdminUserRowActionsProps) {
  return (
    <div className="inline-flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={is_sending_link || !can_receive_link}
        title={
          can_receive_link
            ? `Enviar enlace opcional al correo ${user_profile.email}`
            : "Dominio externo bloqueado: solo se envían enlaces a correos @ab-inbev.com, @gmodelo.com.mx o becarios temporales"
        }
        onClick={() => void on_send_verification_link(user_profile)}
        className="h-8 w-8 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Send className="size-4" />
      </Button>
      {can_extend_intern && (
        <AdminUserExtendPopover
          user_profile={user_profile}
          on_extend_days={on_extend_intern_days}
        />
      )}
      {needs_admin_verification && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={is_approving}
          aria-label={`Aprobar y verificar a ${user_profile.name} sin correo`}
          title={`Aprobar y marcar correo verificado para ${user_profile.name} sin enviar correo`}
          onClick={() => void on_approve_user(user_profile)}
          className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          {is_approving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={`Editar datos personales de ${user_profile.name}`}
        onClick={() => on_edit_user(user_profile.uid)}
        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
      >
        <Pencil className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title={`Eliminar a ${user_profile.name}`}
            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar a{" "}
              <strong className="text-foreground">{user_profile.name}</strong> del sistema? Esta
              acción no se puede deshacer. Se le revocará el acceso inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void on_delete_user(user_profile.uid, user_profile.name)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
