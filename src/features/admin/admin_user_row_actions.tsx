/**
 * @fileoverview Row action controls for activation link dispatch, approval, profile edit, and confirmed deletion.
 */

import { CheckCircle2, Pencil, Send, Trash2 } from "lucide-react";
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

interface AdminUserRowActionsProps {
  user_profile: UserProfile;
  is_sending_link: boolean;
  is_approval_pending: boolean;
  on_send_verification_link: (user_profile: UserProfile) => Promise<void>;
  on_approve_user: (user_profile: UserProfile) => Promise<void>;
  on_edit_user: (uid: string) => void;
  on_delete_user: (uid: string, name: string) => Promise<void>;
}

/** Renders administrative icon buttons and deletion confirmation dialog for a single user row. */
export function AdminUserRowActions({
  user_profile,
  is_sending_link,
  is_approval_pending,
  on_send_verification_link,
  on_approve_user,
  on_edit_user,
  on_delete_user,
}: AdminUserRowActionsProps) {
  return (
    <div className="inline-flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={is_sending_link}
        title={`Enviar enlace a ${user_profile.email} para completar registro y verificación`}
        onClick={() => void on_send_verification_link(user_profile)}
        className="h-8 w-8 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Send className="size-4" />
      </Button>
      {is_approval_pending && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={`Aprobar cuenta de ${user_profile.name}`}
          onClick={() => void on_approve_user(user_profile)}
          className="h-8 w-8 text-amber-600 hover:text-emerald-600 dark:text-amber-400 dark:hover:text-emerald-400 transition-colors"
        >
          <CheckCircle2 className="size-4" />
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
